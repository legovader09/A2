const setBuildObjectType = (sender) => {
  document.querySelectorAll(".editMode").forEach((e) => {
    e.style.backgroundColor = 'lightgrey';
  })
  if (sender !== null) sender.style.backgroundColor = 'lightblue';

  const x = document.getElementById("sliderContainer");
  x.style.display = (sender && sender.id === "t" ? 'block' : 'none');

  if (x.style.display === "none") {
    document.getElementById("treasureValue").value = 1;
    document.getElementById('sliderVal').innerText = 1;
  }
  
  window.Game.buildType = sender && sender.id.toUpperCase();
}

export default setBuildObjectType;