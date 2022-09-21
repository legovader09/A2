const toggleHelpText = () => {
    const x = document.getElementById("ControlsMenu");
    x.style.display = (x.style.display !== "none" ? "none" : "block");
}

export default toggleHelpText;