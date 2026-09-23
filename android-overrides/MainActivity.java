package com.banjaras.ebill;

import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.print.PrintDocumentAdapter;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Lets the web page call window.AndroidPrint.print()
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new PrintBridge(webView), "AndroidPrint");
    }

    public class PrintBridge {
        private final WebView webView;
        PrintBridge(WebView w) { this.webView = w; }

        @JavascriptInterface
        public void print() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                    PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter("Banjaras-Invoice");
                    pm.print("Banjaras-Invoice", adapter, new PrintAttributes.Builder().build());
                }
            });
        }
    }
}
