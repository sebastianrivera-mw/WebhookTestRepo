/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/redirect", "N/runtime", "N/log"], function (require, exports, redirect, runtime, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function SuiteletRedirect(pSuiteletId, pDeploymentId, pActionName, pActionValue) {
        this.suiteletId = pSuiteletId;
        this.deploymentId = pDeploymentId;
        this.actionName = pActionName;
        this.actionValue = pActionValue;
        log.debug("Helper", "Helper");
    }
    exports.SuiteletRedirect = SuiteletRedirect;
    SuiteletRedirect.prototype.redirect = function () {
        runtime.getCurrentSession().set({ name: this.actionName, value: this.actionValue });
        redirect.toSuitelet({ scriptId: this.suiteletId, deploymentId: this.deploymentId });
    };
});

