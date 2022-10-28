const toggleHelpText = (element) => {
  const x = document.getElementById(element);
  if (x !== null) x.style.display = (x.style.display !== "none" ? "none" : "block");
}

export default toggleHelpText;
