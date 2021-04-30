/**
 * @author Midware
 * @developer Gerardo Zeledón
 * @contact contact@midware.net
 */
define(["require", "exports", "N/url", "N/log", "N/runtime"], function (require, exports, url, log, runtime) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function mainView() {
        var currentScript = runtime.getCurrentScript();
        var fileUrl = url.resolveScript({
            scriptId: currentScript.id,
            deploymentId: currentScript.deploymentId,
            params: { action: "getAppJS" },
        });
        log.debug("url of file", fileUrl);
        var pageCode = "\n  <!DOCTYPE html>\n  <html lang=\"en\">\n    <head>\n      <meta charset=\"UTF-8\" />\n\n      <!-- Import Required -->\n      \n\n      <!-- Cargat React -->\n      <script crossorigin src=\"https://unpkg.com/react@16/umd/react.production.min.js\"></script>\n      <script crossorigin src=\"https://unpkg.com/react-dom@16/umd/react-dom.production.min.js\"></script>\n      <script src=\"https://unpkg.com/babel-standalone@6/babel.min.js\"></script>\n\n\n      <title>ReactApp</title>\n    </head>\n    <body>\n      <div id=\"root\"></div>\n      <script type=\"text/babel\" src=\"" + fileUrl + "\"></script>\n    </body>\n  </html>\n  ";
        return pageCode;
    }
    exports.mainView = mainView;
});
