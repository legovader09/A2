const buttonHelper = (sender) => {
  document.querySelectorAll(".editMode").forEach((e) => {
    e.style.backgroundColor = 'lightgrey';
  })
  if (sender !== null) sender.style.backgroundColor = 'lightblue';

  const x = document.getElementById("sliderContainer");
  x.style.display = (sender.id !== "t" ? "none" : "block");

  if (x.style.display === "none") {
    document.getElementById("treasureValue").value = 1;
    document.getElementById('sliderVal').innerText = 1;
  }
}

export default buttonHelper;