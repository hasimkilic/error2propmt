import { captureRuntimeErrors } from "error2prompt";

captureRuntimeErrors({
  onContext(context) {
    console.log(context.markdown);
  }
});