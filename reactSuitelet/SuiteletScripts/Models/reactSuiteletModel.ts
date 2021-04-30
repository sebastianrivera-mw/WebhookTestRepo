/**
 * @author Midware
 * @developer Gerardo Zeledón
 * @contact contact@midware.net
 */

import * as log from "N/log";
import * as search from "N/search";
import * as error from "N/error";
import * as file from "N/file";
import * as runtime from "N/runtime";

import * as constants from "../Constants/Constants";

export function getAppFile() {
  return file.load({
    id: 3349878,
  });
}
