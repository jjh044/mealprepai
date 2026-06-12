package com.prepwise.app;

import android.content.Intent;
import android.net.Uri;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "PrepWiseBilling")
public class PrepWiseBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private BillingClient billingClient;
    private final Map<String, ProductDetails> products = new HashMap<>();
    private PluginCall pendingPurchaseCall;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases()
            .enableAutoServiceReconnection()
            .build();
        connect(null);
    }

    private void connect(Runnable ready) {
        if (billingClient.isReady()) {
            if (ready != null) ready.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && ready != null) {
                    ready.run();
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Billing 8 automatically reconnects before the next API call.
            }
        });
    }

    @PluginMethod
    public void loadProducts(PluginCall call) {
        JSArray ids = call.getArray("productIds");
        if (ids == null || ids.length() == 0) {
            call.reject("productIds are required");
            return;
        }

        connect(() -> {
            List<QueryProductDetailsParams.Product> requested = new ArrayList<>();
            for (Object value : ids.toList()) {
                requested.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(String.valueOf(value))
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build());
            }

            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(requested)
                .build();
            billingClient.queryProductDetailsAsync(params, (result, detailsResult) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(result.getDebugMessage());
                    return;
                }

                JSArray output = new JSArray();
                for (ProductDetails detail : detailsResult.getProductDetailsList()) {
                    products.put(detail.getProductId(), detail);
                    ProductDetails.SubscriptionOfferDetails offer = firstOffer(detail);
                    ProductDetails.PricingPhase phase = recurringPhase(offer);
                    JSObject item = new JSObject();
                    item.put("id", detail.getProductId());
                    item.put("displayName", detail.getName());
                    item.put("displayPrice", phase == null ? null : phase.getFormattedPrice());
                    item.put("period", detail.getProductId().endsWith("yearly") ? "year" : "month");
                    item.put("trial", trialFor(offer));
                    output.put(item);
                }
                JSObject response = new JSObject();
                response.put("products", output);
                call.resolve(response);
            });
        });
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        ProductDetails details = products.get(productId);
        ProductDetails.SubscriptionOfferDetails offer = firstOffer(details);
        if (details == null || offer == null) {
            call.reject("Load the subscription product before purchasing it");
            return;
        }

        BillingFlowParams.ProductDetailsParams productParams =
            BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(details)
                .setOfferToken(offer.getOfferToken())
                .build();
        BillingFlowParams flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(List.of(productParams))
            .build();
        pendingPurchaseCall = call;
        BillingResult result = billingClient.launchBillingFlow(getActivity(), flowParams);
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            pendingPurchaseCall = null;
            call.resolve(stateForBillingResult(result));
        }
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;
        if (call == null) return;

        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || purchases == null || purchases.isEmpty()) {
            call.resolve(stateForBillingResult(result));
            return;
        }
        call.resolve(resultForPurchase(purchases.get(0)));
    }

    @PluginMethod
    public void restore(PluginCall call) {
        queryCurrentPurchase(call, "restored");
    }

    @PluginMethod
    public void refresh(PluginCall call) {
        queryCurrentPurchase(call, "active");
    }

    private void queryCurrentPurchase(PluginCall call, String emptyState) {
        connect(() -> billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build(),
            (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(result.getDebugMessage());
                    return;
                }
                if (purchases.isEmpty()) {
                    call.resolve(new JSObject().put("state", emptyState.equals("restored") ? "unavailable" : "expired"));
                    return;
                }
                call.resolve(resultForPurchase(purchases.get(0)));
            }
        ));
    }

    @PluginMethod
    public void manageSubscriptions(PluginCall call) {
        Intent intent = new Intent(
            Intent.ACTION_VIEW,
            Uri.parse("https://play.google.com/store/account/subscriptions?package=" + getContext().getPackageName())
        );
        getActivity().startActivity(intent);
        call.resolve(new JSObject().put("state", "opened"));
    }

    private JSObject resultForPurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            return new JSObject().put("state", "pending");
        }
        JSObject verification = new JSObject();
        verification.put("platform", "android");
        verification.put("purchaseToken", purchase.getPurchaseToken());
        verification.put("productIds", new JSArray(purchase.getProducts()));
        verification.put("orderId", purchase.getOrderId());
        verification.put("acknowledged", purchase.isAcknowledged());
        JSObject result = new JSObject();
        result.put("state", "verification_required");
        result.put("verification", verification);
        return result;
    }

    private JSObject stateForBillingResult(BillingResult result) {
        String state = result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED
            ? "cancelled"
            : result.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED
                ? "verification_required"
                : "unavailable";
        return new JSObject().put("state", state).put("message", result.getDebugMessage());
    }

    private ProductDetails.SubscriptionOfferDetails firstOffer(ProductDetails details) {
        if (details == null || details.getSubscriptionOfferDetails() == null ||
            details.getSubscriptionOfferDetails().isEmpty()) return null;
        return details.getSubscriptionOfferDetails().get(0);
    }

    private ProductDetails.PricingPhase recurringPhase(ProductDetails.SubscriptionOfferDetails offer) {
        if (offer == null) return null;
        List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
        return phases.isEmpty() ? null : phases.get(phases.size() - 1);
    }

    private JSObject trialFor(ProductDetails.SubscriptionOfferDetails offer) {
        if (offer == null) return null;
        for (ProductDetails.PricingPhase phase : offer.getPricingPhases().getPricingPhaseList()) {
            if (phase.getPriceAmountMicros() == 0) {
                return new JSObject().put("displayText", "Free trial available");
            }
        }
        return null;
    }
}
