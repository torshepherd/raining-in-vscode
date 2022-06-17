// @ts-check

(function () {
  document.body.style.backgroundImage =
    'url("' + getSvgURI().replace(/(\r\n|\n|\r)/gm, "") + '")';
  document.body.style.opacity = getOpacity();

  console.log("RAINING IN V S C O D E: DOWNPOUR initialised!");
})();

function getOpacity() {
  const opacityStr = "OPACITYGOESHERE";
  const opacityVal = parseFloat(opacityStr);
  return !isNaN(opacityVal) && opacityVal >= 0.0 && opacityVal <= 1.0
    ? opacityStr
    : "0.95";
}

function getSvgURI() {
  return "SVGURIGOESHERE";
}
