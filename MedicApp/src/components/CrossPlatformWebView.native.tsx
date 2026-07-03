import React from 'react';
import { WebView, WebViewProps } from 'react-native-webview';

const CrossPlatformWebView: React.FC<WebViewProps> = (props) => <WebView {...props} />;

export default CrossPlatformWebView;
