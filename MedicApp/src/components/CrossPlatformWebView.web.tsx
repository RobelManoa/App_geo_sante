import React, { useEffect, useRef } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface CrossPlatformWebViewProps {
  source: { html: string };
  onMessage?: (event: { nativeEvent: { data: string } }) => void;
  style?: StyleProp<ViewStyle>;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
}

// react-native-webview has no web implementation, so on web we render the
// same HTML in a sandboxed iframe instead and shim window.ReactNativeWebView
// so screens can keep using window.ReactNativeWebView.postMessage(...) unchanged.
const BRIDGE_SCRIPT = `<script>
  window.ReactNativeWebView = {
    postMessage: function (data) {
      window.parent.postMessage(data, '*');
    }
  };
</script>`;

const CrossPlatformWebView: React.FC<CrossPlatformWebViewProps> = ({ source, onMessage, style }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!onMessage) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      onMessage({ nativeEvent: { data: event.data } });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);

  const html = source.html.includes('<head>')
    ? source.html.replace('<head>', `<head>${BRIDGE_SCRIPT}`)
    : BRIDGE_SCRIPT + source.html;

  return (
    <View style={style}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="map"
        style={{ border: 'none', width: '100%', height: '100%' }}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </View>
  );
};

export default CrossPlatformWebView;
