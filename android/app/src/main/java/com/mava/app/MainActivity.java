package com.mava.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    lockWebViewTextZoom();
  }

  @Override
  public void onResume() {
    super.onResume();
    lockWebViewTextZoom();
  }

  private void lockWebViewTextZoom() {
    if (getBridge() == null) {
      return;
    }
    WebView webView = getBridge().getWebView();
    if (webView != null) {
      webView.getSettings().setTextZoom(100);
    }
  }
}
