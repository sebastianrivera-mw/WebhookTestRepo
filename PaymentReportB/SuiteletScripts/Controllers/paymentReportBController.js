define(["require", "exports", "N/log", "N/runtime", "../Views/paymentReportBView", "../Models/paymentReportBModel", "../../Constants/Constants", "../../Helpers/suiteMVC"], function (require, exports, log, runtime, view, model, constants, suiteMVC) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function getView() {
        return view.mainView(getCurrentStatus());
    }
    exports.getView = getView;
    function updatePaymentes(pData) {
        var result = model.updatePayments(pData);
        var currentScript = runtime.getCurrentScript();
        return new suiteMVC.SuiteletRedirect(currentScript.id, currentScript.deploymentId, constants.GENERAL.STATUS_FLAG, result);
    }
    exports.updatePaymentes = updatePaymentes;
    function getCurrentStatus() {
        var currentStatus = runtime.getCurrentSession().get({ name: constants.GENERAL.STATUS_FLAG });
        log.debug("Current Status 1", currentStatus);
        runtime.getCurrentSession().set({ name: constants.GENERAL.STATUS_FLAG, value: null });
        log.debug("Current Status 2", currentStatus);
        return currentStatus;
    }
});

