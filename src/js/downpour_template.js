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
    /* append the remaining styles */

    //     updatedThemeStyles = `${updatedThemeStyles}.monaco-editor .margin, .monaco-editor .inputarea.ime-input, .editor-scrollable, .monaco-editor-background, .view-lines {
    //   background: transparent;
    // }

    // /* Add the subtle gradient to the editor background */
    // .monaco-editor {
    //   background-color: transparent !important;
    //   background-image: linear-gradient(to bottom, #2a2139 75%, #34294f);
    //   background-size: auto 100vh;
    //   background-position: top;
    //   background-repeat: no-repeat;
    // }
    // .rain {
    //   position: absolute;
    //   left: 0;
    //   width: 100%;
    //   height: 100%;
    //   z-index: 2;
    // }

    // .rain.back-row {
    //   display: none;
    //   z-index: 1;
    //   bottom: 60px;
    //   opacity: 0.5;
    // }

    // .drop {
    //   position: absolute;
    //   bottom: 100%;
    //   width: 15px;
    //   height: 120px;
    //   pointer-events: none;
    //   animation: drop 0.5s linear infinite;
    // }

    // @keyframes drop {
    //   0% {
    //     transform: translateY(0vh);
    //   }
    //   75% {
    //     transform: translateY(90vh);
    //   }
    //   100% {
    //     transform: translateY(90vh);
    //   }
    // }

    // .stem {
    //   width: 1px;
    //   height: 60%;
    //   margin-left: 7px;
    //   background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.25));
    //   animation: stem 0.5s linear infinite;
    // }

    // @keyframes stem {
    //   0% {
    //     opacity: 1;
    //   }
    //   65% {
    //     opacity: 1;
    //   }
    //   75% {
    //     opacity: 0;
    //   }
    //   100% {
    //     opacity: 0;
    //   }
    // }
    // .splat {
    //   width: 15px;
    //   height: 10px;
    //   border-top: 2px dotted rgba(255, 255, 255, 0.5);
    //   border-radius: 50%;
    //   opacity: 1;
    //   transform: scale(0);
    //   animation: splat 0.5s linear infinite;
    //   display: none;
    // }

    // @keyframes splat {
    //   0% {
    //     opacity: 1;
    //     transform: scale(0);
    //   }
    //   80% {
    //     opacity: 1;
    //     transform: scale(0);
    //   }
    //   90% {
    //     opacity: 0.5;
    //     transform: scale(1);
    //   }
    //   100% {
    //     opacity: 0;
    //     transform: scale(1.5);
    //   }
    // }
    // `;

    // const newStyleTag = document.createElement("style");
    // newStyleTag.setAttribute("id", "raining-in-theme-styles");
    // newStyleTag.innerText = updatedThemeStyles.replace(/(\r\n|\n|\r)/gm, "");
    // document.body.appendChild(newStyleTag);

    console.log("Raining In: DOWNPOUR initialised!");

    // disconnect the observer because we don't need it anymore
    if (obs) {
      obs.disconnect();
      // @ts-ignore
      obs = null;
    }
  };

  // // Callback function to execute when mutations are observed
  // const watchForBootstrap = function (
  //   /** @type {any} */ mutationsList,
  //   /** @type {{ disconnect: any; observe?: any; }} */ observer
  // ) {
  //   for (let mutation of mutationsList) {
  //     if (mutation.type === "attributes") {
  //       // only init if we're using a Raining In subtheme
  //       const isUsingRainingIn = document.querySelector(
  //         '[class*="exotic_sangria-raining-in-vscode-themes"]'
  //       );
  //       // does the style div exist yet?
  //       const tokensLoaded = document.querySelector(".vscode-tokens-styles");
  //       // does it have content ?
  //       const tokenStyles =
  //         document.querySelector(".vscode-tokens-styles").innerText &&
  //         document.querySelector(".vscode-tokens-styles").innerText !== "";

  //       if (/*isUsingRainingIn && */ tokensLoaded) {
  //         if (!tokenStyles) {
  //           // sometimes VS code takes a while to init the styles content, so if there stop this observer and add an observer for that
  //           observer.disconnect();
  //           observer.observe(tokensLoaded, { childList: true });
  //         } else {
  //           // If everything we need is ready, then initialise
  //           initDownpour(false, observer);
  //         }
  //       }
  //     }
  //     if (mutation.type === "childList") {
  //       const isUsingRainingIn = document.querySelector(
  //         '[class*="exotic_sangria-raining-in-vscode-themes"]'
  //       );
  //       const tokensLoaded = document.querySelector(".vscode-tokens-styles");
  //       const tokenStyles =
  //         document.querySelector(".vscode-tokens-styles").innerText &&
  //         document.querySelector(".vscode-tokens-styles").innerText !== "";

  //       // Everything we need is ready, so initialise
  //       if (/*isUsingRainingIn && */ tokensLoaded && tokenStyles) {
  //         initDownpour(false, observer);
  //       }
  //     }
  //   }
  // };

  // try to initialise the theme
  initDownpour();

  // // Use a mutation observer to check when we can bootstrap the theme
  // const observer = new MutationObserver(watchForBootstrap);
  // observer.observe(bodyNode, { attributes: true });
})();
