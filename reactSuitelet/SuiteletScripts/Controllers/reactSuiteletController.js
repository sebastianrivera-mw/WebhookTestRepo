define(["require", "exports", "../Views/reactSuiteletView", "../Models/reactSuiteletModel"], function (require, exports, view, model) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function getMainPage() {
        return view.mainView();
    }
    exports.getMainPage = getMainPage;
    function getMainScript() {
        return model.getAppFile();
    }
    exports.getMainScript = getMainScript;
});

