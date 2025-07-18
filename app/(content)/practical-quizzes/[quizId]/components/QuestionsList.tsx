"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import Button from "@/components/Button";
import { PracticalQuestion } from "@/types";
import { useQuestions } from "@/lib/hooks";
import ButtonIcon from "@/components/ButtonIcon";

enum QuestionState {
  TRUE,
  FALSE,
  UNANSWERED,
  UNSELECTED,
}

const border = new Map([
  [QuestionState.TRUE, "border-green-600"],
  [QuestionState.FALSE, "border-red-600"],
  [QuestionState.UNANSWERED, "border-slate-700"],
  [QuestionState.UNSELECTED, "border-slate-700"],
]);

const writtenAnswer = new Map([
  [QuestionState.TRUE, "text-green-600"],
  [QuestionState.FALSE, "text-red-600"],
  [QuestionState.UNANSWERED, "text-slate-700"],
  [QuestionState.UNSELECTED, "text-slate-700"],
]);

const borderSummary = new Map([
  [QuestionState.TRUE, "border-green-600"],
  [QuestionState.FALSE, "border-red-600"],
  [QuestionState.UNANSWERED, "border-yellow-600"],
  [QuestionState.UNSELECTED, "border-yellow-600"],
]);

const writtenAnswerSummary = new Map([
  [QuestionState.TRUE, "text-green-600"],
  [QuestionState.FALSE, "text-red-600"],
  [QuestionState.UNANSWERED, "text-yellow-600"],
  [QuestionState.UNSELECTED, "text-yellow-600"],
]);

const X_MARGIN = 8;

function SelectAnswerDialogue({
  onTrue,
  onFalse,
  className,
  style,
}: {
  onTrue: () => void;
  onFalse: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`w-max flex items-center rounded-md overflow-hidden text-sm *:px-1 *:py-0.5 *:text-white *:transition-colors ${className}`}
    >
      <button className="bg-green-600 hover:bg-green-700" onClick={onTrue}>
        True
      </button>
      <button className="bg-red-600 hover:bg-red-700" onClick={onFalse}>
        False
      </button>
    </div>
  );
}

export default function QuestionsList({
  quizId,
  title,
  questions,
}: {
  quizId: number;
  title: string;
  questions: PracticalQuestion[];
}) {
  const [answers, setAnswers] = useState({
    tapes: new Map<number, QuestionState>(),
    writtenQuestions: new Map<number, QuestionState>(),
  });
  const {
    currentQuestion,
    setCurrentQuestion,
    currentIndex,
    backQuestion,
    nextQuestion,
    showingResults,
    setShowingResults,
    isLoaded,
  } = useQuestions(
    questions,
    `practical-quiz-${quizId}`,
    answers,
    (x) => {
      return JSON.stringify({
        tapes: Array.from(x.tapes),
        writtenQuestions: Array.from(x.writtenQuestions),
      });
    },
    (storedAnswersString) => {
      if (storedAnswersString) {
        const { tapes, writtenQuestions } = JSON.parse(storedAnswersString);
        const temp = {
          tapes: new Map<number, QuestionState>(tapes),
          writtenQuestions: new Map<number, QuestionState>(writtenQuestions),
        };
        questions.forEach((questions) => {
          questions.tapes.forEach(({ id }) =>
            temp.tapes.set(
              id,
              temp.tapes.has(id)
                ? temp.tapes.get(id)!
                : QuestionState.UNANSWERED
            )
          );
          questions.writtenQuestions.forEach(({ id }) =>
            temp.writtenQuestions.set(
              id,
              temp.writtenQuestions.has(id)
                ? temp.writtenQuestions.get(id)!
                : QuestionState.UNANSWERED
            )
          );
        });
        setAnswers(temp);
      } else {
        const temp = { tapes: new Map(), writtenQuestions: new Map() };
        questions.forEach((questions) => {
          questions.tapes.forEach(({ id }) =>
            temp.tapes.set(id, QuestionState.UNANSWERED)
          );
          questions.writtenQuestions.forEach(({ id }) =>
            temp.writtenQuestions.set(id, QuestionState.UNANSWERED)
          );
        });
        setAnswers(temp);
      }
    }
  );
  const updateTapeState = useCallback(
    (id: number, newState: QuestionState) => {
      setAnswers((prev) => {
        const temp = {
          writtenQuestions: prev.writtenQuestions,
          tapes: new Map(),
        };
        prev.tapes.forEach((answer, tapeId) => {
          if (tapeId === id) temp.tapes.set(id, newState);
          else temp.tapes.set(tapeId, answer);
        });
        return temp;
      });
    },
    [currentQuestion]
  );
  const updateWrittenQuestionState = useCallback(
    (id: number, newState: QuestionState) => {
      setAnswers((prev) => {
        const temp = {
          writtenQuestions: new Map(),
          tapes: prev.tapes,
        };
        prev.writtenQuestions.forEach((answer, writtenQuestionId) => {
          if (writtenQuestionId === id) temp.writtenQuestions.set(id, newState);
          else temp.writtenQuestions.set(writtenQuestionId, answer);
        });
        return temp;
      });
    },
    [currentQuestion]
  );
  const [factor, setFactor] = useState(
    (outerWidth - X_MARGIN * 2 > 512 ? 512 : outerWidth - X_MARGIN * 2) /
      questions[currentIndex].width
  );

  useEffect(() => {
    const adjustImage = () => {
      const width =
        outerWidth - X_MARGIN * 2 > 512 ? 512 : outerWidth - X_MARGIN * 2;
      setFactor(width / questions[currentIndex].width);
    };
    window.addEventListener("resize", adjustImage);
    return () => {
      window?.removeEventListener("resize", adjustImage);
    };
  }, [currentIndex]);

  if (!isLoaded) return;

  if (showingResults) {
    let total = answers.tapes.size + answers.writtenQuestions.size;
    let correct = 0;
    answers.tapes.forEach((value) => value === QuestionState.TRUE && correct++);
    answers.writtenQuestions.forEach(
      (value) => value === QuestionState.TRUE && correct++
    );
    return (
      <>
        <div className="flex gap-2 mb-4">
          <ButtonIcon
            icon="arrow-path"
            onClick={() => {
              setCurrentQuestion(questions[0].id);
              setAnswers((prev) => {
                const temp = { tapes: new Map(), writtenQuestions: new Map() };
                prev.tapes.forEach((_, key) =>
                  temp.tapes.set(key, QuestionState.UNANSWERED)
                );
                prev.writtenQuestions.forEach((_, key) =>
                  temp.writtenQuestions.set(key, QuestionState.UNANSWERED)
                );
                return temp;
              });
              setShowingResults(false);
            }}
          />
        </div>
        <h2 className="my-4">
          Result → {correct} / {total} (
          {Math.round((correct / total) * 10000) / 100}%)
        </h2>
        <h2 className="my-4">Summary</h2>
        <p className="my-4">
          <span className="text-green-600">* Correct</span>
          <br />
          <span className="text-red-600">* Incorrect</span>
          <br />
          <span className="text-yellow-600">* Skipped</span>
        </p>
        <ol>
          {questions.map((question) => (
            <>
              <div className="relative mb-4">
                <img
                  src={`${process.env.NEXT_PUBLIC_STATIC_URL}/image/${question.image}`}
                  width={question.width * factor}
                  height={question.height * factor}
                  alt="Question"
                />
                {question.masks.map(({ id, x, y, w, h }) => (
                  <div
                    key={"mask-" + id}
                    style={{
                      position: "absolute",
                      left: x * factor,
                      top: y * factor,
                      width: w * factor,
                      height: h * factor,
                      background: "white",
                      border: "2px solid black",
                    }}
                  ></div>
                ))}
                {question.tapes.map(({ id, x, y, w, h }) => (
                  <div
                    key={"tape-" + id}
                    className={`border-2 ${borderSummary.get(
                      answers.tapes.get(id)!
                    )}`}
                    style={{
                      position: "absolute",
                      left: x * factor,
                      top: y * factor,
                      width: w * factor,
                      height: h * factor,
                    }}
                  ></div>
                ))}
              </div>
              <ol className="mb-4">
                {question.writtenQuestions.map(
                  ({ id, text, answer }, index) => {
                    const questionState = answers.writtenQuestions.get(id)!;
                    return (
                      <li key={`question-${id}`}>
                        <p className="font-bold">
                          {index + 1}. {text}
                        </p>
                        <p className={writtenAnswerSummary.get(questionState)}>
                          {answer}
                        </p>
                      </li>
                    );
                  }
                )}
              </ol>
            </>
          ))}
        </ol>
      </>
    );
  }
  return (
    <div className="max-w-lg">
      <h2 className="mb-4">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <div className="relative mb-4">
        <img
          src={`${process.env.NEXT_PUBLIC_STATIC_URL}/image/${questions[currentIndex].image}`}
          width={questions[currentIndex].width * factor}
          height={questions[currentIndex].height * factor}
          alt="Question"
        />
        {questions[currentIndex].masks.map(({ id, x, y, w, h }) => (
          <div
            key={"mask-" + id}
            style={{
              position: "absolute",
              left: x * factor,
              top: y * factor,
              width: w * factor,
              height: h * factor,
              background: "white",
              border: "2px solid black",
            }}
          ></div>
        ))}
        {questions[currentIndex].tapes.map(({ id, x, y, w, h }) => {
          const questionState = answers.tapes.get(id)!;
          return (
            <>
              {questionState === QuestionState.UNSELECTED && (
                <SelectAnswerDialogue
                  key={"dialogue-" + id}
                  style={{
                    position: "absolute",
                    top: y * factor - 30,
                    left: x * factor,
                  }}
                  onTrue={() => updateTapeState(id, QuestionState.TRUE)}
                  onFalse={() => updateTapeState(id, QuestionState.FALSE)}
                />
              )}
              <button
                className={`border-2 ${border.get(questionState)} ${
                  questionState === QuestionState.UNANSWERED && "bg-yellow-200"
                }`}
                key={"tape-" + id}
                style={{
                  position: "absolute",
                  left: x * factor,
                  top: y * factor,
                  width: w * factor,
                  height: h * factor,
                }}
                onClick={() => {
                  if (answers.tapes.get(id) === QuestionState.UNANSWERED) {
                    updateTapeState(id, QuestionState.UNSELECTED);
                  }
                }}
              ></button>
            </>
          );
        })}
      </div>
      <ol className="mb-4">
        {questions[currentIndex].writtenQuestions.map(
          ({ id, text, answer }, index) => {
            const questionState = answers.writtenQuestions.get(id)!;
            return (
              <li key={`question-${id}`}>
                <p className="font-bold">
                  {index + 1}. {text}
                </p>
                {questionState === QuestionState.UNSELECTED && (
                  <SelectAnswerDialogue
                    onTrue={() =>
                      updateWrittenQuestionState(id, QuestionState.TRUE)
                    }
                    onFalse={() =>
                      updateWrittenQuestionState(id, QuestionState.FALSE)
                    }
                  />
                )}
                {questionState !== QuestionState.UNANSWERED ? (
                  <p className={writtenAnswer.get(questionState)}>{answer}</p>
                ) : (
                  <button
                    className="font-bold text-cyan-600"
                    onClick={() =>
                      updateWrittenQuestionState(id, QuestionState.UNSELECTED)
                    }
                  >
                    [...]
                  </button>
                )}
              </li>
            );
          }
        )}
      </ol>
      <div className="flex justify-between mb-4">
        <Button onClick={backQuestion} disabled={currentIndex === 0}>
          ← Back
        </Button>
        <Button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
        >
          Continue →
        </Button>
      </div>
      <div className="flex justify-between mb-4">
        <select
          onChange={(e) => setCurrentQuestion(+e.target.value)}
          value={currentQuestion}
        >
          {questions.map(({ id }, index) => (
            <option key={id} value={id}>
              Question {index + 1}
            </option>
          ))}
        </select>
        <Button color="yellow" onClick={() => setShowingResults(true)}>
          End Quiz
        </Button>
      </div>
    </div>
  );
}
