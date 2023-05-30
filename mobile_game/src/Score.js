export default class Score {
  constructor() {
    this.score = 0;
  }

  getScore() {
    return this.score;
  }

  incrementScore() {
    this.score += 10;
  }
}
  