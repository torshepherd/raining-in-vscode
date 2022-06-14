// @ts-check

(function () {
  console.log(" Downpour");
  // Grab body node
  const bodyNode = document.querySelector("body");

  // Replace the styles with the glow theme
  const initDownpour = (
    /** @type {{ disconnect: () => void; }} */ obs
  ) => {
    document.body.style.backgroundImage = 'url("rain.svg")';
    document.body.style.opacity = "0.95";

    console.log("RAINING IN V S C O D E: DOWNPOUR initialised!");

    // disconnect the observer because we don't need it anymore
    if (obs) {
      obs.disconnect();
      // @ts-ignore
      obs = null;
    }
  };

  // try to initialise the theme
  initDownpour();
})();
