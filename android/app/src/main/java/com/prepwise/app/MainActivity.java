package com.prepwise.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PrepWiseBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
