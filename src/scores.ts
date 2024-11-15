const ScoresKey = "highScores";

type highScore = {
  score: number|null;
  date: Date | null;
};

export const loadScores = (): highScore[] => {
  const data = localStorage.getItem(ScoresKey);
  if (data === null) {
    return [
      { score:null , date: null },
      { score: null, date: null },
      { score: null, date: null },
    ];
  }
  return JSON.parse(data);
};

export const saveScore = (score: number) => {
  const data = localStorage.getItem(ScoresKey);
  const scores: highScore[] = JSON.parse(data || "[]");
  // add the new score
  scores.push({ score: score, date: new Date() });
  // sort
  scores.sort((a, b) => b.score - a.score);
  // take the top 3
  localStorage.setItem(ScoresKey, JSON.stringify(scores.slice(0, 3)));
};
