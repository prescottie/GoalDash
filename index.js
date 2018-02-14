function saveGoal(period, value) {

}

const dailyGoalInput = document.getElementById('dailyGoal');

dailyGoalInput.addEventListener('submit', () => {
  saveGoal(daily, dailyGoalInput.value);
})