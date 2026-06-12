import Capacitor

class PrepWiseViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(PrepWiseBillingPlugin())
    }
}
