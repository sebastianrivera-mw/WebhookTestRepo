/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */

import * as redirect from "N/redirect";
import * as runtime from "N/runtime";
import * as log from "N/log";

export function SuiteletRedirect(pSuiteletId, pDeploymentId, pActionName, pActionValue) {
  this.suiteletId = pSuiteletId;
  this.deploymentId = pDeploymentId;
  this.actionName = pActionName;
  this.actionValue = pActionValue;
  log.debug("Helper", "Helper");
}

SuiteletRedirect.prototype.redirect = function () {
  runtime.getCurrentSession().set({ name: this.actionName, value: this.actionValue });
  redirect.toSuitelet({ scriptId: this.suiteletId, deploymentId: this.deploymentId });
};

