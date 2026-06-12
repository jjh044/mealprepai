import Capacitor
import StoreKit
import UIKit

@objc(PrepWiseBillingPlugin)
public final class PrepWiseBillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PrepWiseBillingPlugin"
    public let jsName = "PrepWiseBilling"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "loadProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "manageSubscriptions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "refresh", returnType: CAPPluginReturnPromise),
    ]

    private var products: [String: Product] = [:]
    private var updatesTask: Task<Void, Never>?

    public override func load() {
        updatesTask = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                guard case .verified(let transaction) = update else { continue }
                let result = await self.result(for: transaction, state: "success")
                self.notifyListeners("entitlementChanged", data: result)
                await transaction.finish()
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    @objc func loadProducts(_ call: CAPPluginCall) {
        let ids = call.getArray("productIds", String.self) ?? []
        Task {
            do {
                let loaded = try await Product.products(for: ids)
                products = Dictionary(uniqueKeysWithValues: loaded.map { ($0.id, $0) })
                call.resolve(["products": loaded.map(productPayload)])
            } catch {
                call.reject("App Store products are unavailable", nil, error)
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"), let product = products[productId] else {
            call.reject("Load the subscription product before purchasing it")
            return
        }

        Task {
            do {
                switch try await product.purchase() {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else {
                        call.reject("The App Store transaction could not be verified")
                        return
                    }
                    let result = await result(for: transaction, state: "success", signedTransaction: verification.jwsRepresentation)
                    await transaction.finish()
                    call.resolve(result)
                case .pending:
                    call.resolve(["state": "pending"])
                case .userCancelled:
                    call.resolve(["state": "cancelled"])
                @unknown default:
                    call.resolve(["state": "unavailable"])
                }
            } catch {
                call.reject("The purchase could not be completed", nil, error)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(await currentEntitlement(state: "restored"))
            } catch {
                call.reject("Purchases could not be restored", nil, error)
            }
        }
    }

    @objc func refresh(_ call: CAPPluginCall) {
        Task {
            call.resolve(await currentEntitlement(state: "active"))
        }
    }

    @objc func manageSubscriptions(_ call: CAPPluginCall) {
        guard let url = URL(string: "https://apps.apple.com/account/subscriptions") else {
            call.resolve(["state": "unavailable"])
            return
        }
        DispatchQueue.main.async {
            UIApplication.shared.open(url)
            call.resolve(["state": "opened"])
        }
    }

    private func currentEntitlement(state: String) async -> [String: Any] {
        for await verification in Transaction.currentEntitlements {
            guard case .verified(let transaction) = verification else { continue }
            if transaction.productType == .autoRenewable {
                return await result(for: transaction, state: state, signedTransaction: verification.jwsRepresentation)
            }
        }
        return ["state": "expired"]
    }

    private func result(
        for transaction: Transaction,
        state: String,
        signedTransaction: String? = nil
    ) async -> [String: Any] {
        let entitlementState: String
        if transaction.revocationDate != nil {
            entitlementState = "revoked"
        } else if let expirationDate = transaction.expirationDate, expirationDate <= Date() {
            entitlementState = "expired"
        } else {
            entitlementState = "active"
        }

        var entitlement: [String: Any] = [
            "productId": transaction.productID,
            "state": entitlementState,
            "originalTransactionId": String(transaction.originalID),
            "source": "storekit-verified",
        ]
        if let expirationDate = transaction.expirationDate {
            entitlement["expiresAt"] = ISO8601DateFormatter().string(from: expirationDate)
        }

        var payload: [String: Any] = [
            "state": entitlementState == "active" ? state : entitlementState,
            "entitlement": entitlement,
        ]
        if let signedTransaction {
            payload["verification"] = [
                "platform": "ios",
                "signedTransaction": signedTransaction,
            ]
        }
        return payload
    }

    private func productPayload(_ product: Product) -> [String: Any] {
        var payload: [String: Any] = [
            "id": product.id,
            "displayName": product.displayName,
            "displayPrice": product.displayPrice,
            "period": periodName(product.subscription?.subscriptionPeriod),
        ]
        if let offer = product.subscription?.introductoryOffer {
            payload["trial"] = ["displayText": offerDescription(offer)]
        }
        return payload
    }

    private func periodName(_ period: Product.SubscriptionPeriod?) -> String {
        guard let period else { return "subscription" }
        switch period.unit {
        case .day: return period.value == 7 ? "week" : "day"
        case .week: return "week"
        case .month: return "month"
        case .year: return "year"
        @unknown default: return "subscription"
        }
    }

    private func offerDescription(_ offer: Product.SubscriptionOffer) -> String {
        let period = periodName(offer.period)
        return offer.paymentMode == .freeTrial
            ? "\(offer.period.value) \(period)\(offer.period.value == 1 ? "" : "s") free"
            : "Introductory offer available"
    }
}
