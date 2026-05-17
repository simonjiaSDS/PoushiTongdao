import UIKit
import WebKit

class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {

    var webView: WKWebView!

    override func loadView() {
        let webConfiguration = WKWebViewConfiguration()
        
        // 允许读取本地文件（iOS 9+）
        if #available(iOS 9.0, *) {
            webConfiguration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        }
        
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = false
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadLocalIndex()
    }

    private func loadLocalIndex() {
        // 尝试从 Bundle 加载 index.html
        if let indexPath = Bundle.main.url(forResource: "index", withExtension: "html") {
            let dataDir = indexPath.deletingLastPathComponent()
            webView.loadFileURL(indexPath, allowingReadAccessTo: dataDir)
        } else {
            // 如果找不到，显示错误页面
            showErrorPage()
        }
    }

    private func showErrorPage() {
        let html = """
        <html>
        <head><meta charset="utf-8"><title>错误</title></head>
        <body style="font-family:sans-serif;padding:40px;text-align:center;">
            <h2>⚠️ 文件未找到</h2>
            <p>请将 index.html / app.js / style.css 添加到 Xcode 项目的 Bundle Resources 中。</p>
        </body>
        </html>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("[WebView] 加载失败: \(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("[WebView] 页面加载完成")
    }
}
