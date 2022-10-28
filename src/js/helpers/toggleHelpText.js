const toggleHelpText = () => {
    const x = document.getElementById("ControlsMenu");
    if (x !== null) x.style.display = (x.style.display !== "none" ? "none" : "block");
}