/**
 * @author Midware
 * @developer Gerardo Zeledón
 * @contact contact@midware.net
 */

import * as error from "N/error";
import * as url from "N/url";
import * as serverWidget from "N/ui/serverWidget";
import * as log from "N/log";
import * as runtime from "N/runtime";

import * as constants from "../Constants/Constants";

export function mainView() {
  let currentScript = runtime.getCurrentScript();

  let fileUrl = url.resolveScript({
    scriptId: currentScript.id,
    deploymentId: currentScript.deploymentId,
    params: { action: "getAppJS" },
  });

  log.debug("url of file", fileUrl);
  let pageCode = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />

      <!-- Import Required -->
      

      <!-- Cargat React -->
      <script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>


      <title>ReactApp</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel" src="${fileUrl}"></script>
    </body>
  </html>
  `;
  return pageCode;
}
