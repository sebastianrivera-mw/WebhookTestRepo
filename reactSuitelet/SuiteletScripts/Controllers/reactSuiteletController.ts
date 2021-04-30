/**
 * @author Midware
 * @developer Gerardo Zeledón
 * @contact contact@midware.net
 */
import * as log from "N/log";

//import the views
import * as view from "../Views/reactSuiteletView";
//import the models
import * as model from "../Models/reactSuiteletModel";

import * as constants from "../Constants/Constants";

export function getMainPage() {
  return view.mainView();
}

export function getMainScript() {
  return model.getAppFile();
}
