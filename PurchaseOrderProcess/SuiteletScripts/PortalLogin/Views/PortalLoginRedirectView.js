/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function redirect(pURL) {
        var redirectHTML = "<!DOCTYPE html>\n    <html>\n        <head>\n        </head>\n        <body>\n        <div aria-label=\"loading\" class=\"loader\"></div>\n\n        <style>\n        .loader {\n            border: 20px solid #f3f3f3;\n            border-radius: 50%;\n            border-top: 20px solid black;\n            border-right: 20px solid black;\n            border-bottom: 20px solid pink;\n            border-left: 20px solid pink;\n            width: 120px;\n            height: 120px;\n            -webkit-animation: spin 2s linear infinite;\n            animation: spin 2s linear infinite;\n            position: absolute;\n            left: 50%;\n            top: 35%;\n            margin-left: -50px;\n        }\n        \n        @keyframes spin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n        }\n            </style>     \n            \n        <script>\n            function redirect() {\n                var newURL = new URL(document.location.href);\n                \n                if ('" + pURL + "' !== 'null' && '" + pURL + "' !== 'undefined'){\n                    console.log(\"Redirecting " + pURL + "\")\n                    window.location.replace('" + pURL + "');\n                }\n                else{\n                    window.location.replace(newURL.href);\n                }\n            };\n\n                console.log(\"Redirecting " + pURL + "\")\n            setTimeout(redirect, 1000);\n        </script>   \n        </body>\n    </html>";
        return redirectHTML;
    }
    exports.redirect = redirect;
});
