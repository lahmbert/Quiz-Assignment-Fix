'use client';

import Navbar from '@/components/navbar';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TakeQuiz() {
  const router = useRouter();
  const [isOpenBars, setIsOpenBars] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
        return;
      }
    };

    const fetchQuestions = async () => {
      const { data: question, error: errorQuestions } = await supabase
        .from('questions')
        .select(
          'id, quizzes(title), question_text, quiz_id, answers(id, answer_text, is_correct)'
        );
      if (errorQuestions) {
        console.error('Error fetching questions', errorQuestions);
        return;
      }
      setQuestions(question);
    };
    checkUser();
    fetchQuestions();
  }, [router]);

  const handleAnswerSelect = (answerId, isCorrect) => {
    setSelectedAnswer(answerId);
    setIsAnswerCorrect(isCorrect);
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // Simulate delay before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
      } else {
        // If it's the last question, save the score to the database
        saveScore();
        setQuizFinished(true);
      }
    }, 1000); // Delay 1 second before moving to the next question
  };

  const saveScore = async () => {
    const { data: dataUser, error: getError } = await supabase.auth.getUser();
    if (getError || !dataUser) {
      console.error('Error getting user', getError);
      return;
    }

    const { data: userEmail, error: userError } = await supabase
      .from('users')
      .select('*');
    if (userError || !userEmail) {
      console.error('Error fetching user:', userError);
      return;
    }

    let userId;
    for (let index = 0; index < userEmail.length; index++) {
      if (dataUser.user.email === userEmail[index].email) {
        userId = userEmail[index].id;
        break;
      }
    }

    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('user_id', userId)
      .eq('quiz_id', questions[currentQuestionIndex]?.quiz_id);

    if (deleteError) {
      console.error('Error deleting previous score', deleteError);
      return;
    } else {
      console.log('Previous score deleted successfully');
    }

    // Directly using user.id instead of querying 'users' table
    const { error } = await supabase.from('scores').insert([
      {
        quiz_id: questions[currentQuestionIndex]?.quiz_id,
        user_id: userId, // Directly use user.id from authentication
        score: score + 1,
      },
    ]);

    if (error) {
      console.error('Error saving score', error);
    } else {
      console.log('Score saved successfully');
    }
  };

  const handleTestAgain = () => {
    // Reset state to start the quiz again
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setQuizFinished(false); // Reset the quizFinished state
  };
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-gradient-to-bl from-blue-400 h-screen to-purple-400">
      <Navbar isOpenBars={isOpenBars} setIsOpenBars={setIsOpenBars} />
      <div className="flex justify-center text-center">
        <div
          className={`${
            isOpenBars ? 'mt-2' : 'mt-16'
          } p-8 sm:p-[4rem] mx-4 bg-slate-50 pb-16 flex flex-col gap-8 sm:w-[35rem] shadow-md rounded-md`}
        >
          {!quizFinished ? (
            <>
              <div className="text-2xl font-bold">
                {currentQuestion?.quizzes?.title}
              </div>
              <div className="pb-5">{currentQuestion?.question_text}</div>
              <div className="flex justify-center text-white gap-12 sm:gap-[10rem]">
                <div className="grid grid-cols-2 gap-10">
                  {currentQuestion?.answers.map((answer) => (
                    <div className="flex items-center" key={answer.id}>
                      <button
                        onClick={() =>
                          handleAnswerSelect(answer.id, answer.is_correct)
                        }
                        className={`p-1 w-full px-6 hover:-translate-y-1 duration-200 shadow-lg rounded-full ${
                          selectedAnswer === answer.id
                            ? answer.is_correct
                              ? 'bg-green-500'
                              : 'bg-red-500'
                            : 'bg-gradient-to-bl from-blue-500 to-purple-500'
                        }`}
                      >
                        {answer.answer_text}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="flex justify-center mb-10 text-center">
                <img src="/img/animation-01.gif" />
              </div>
              <div className="text-xl font-semibold">Your Score: {score}</div>
              <div className="mt-14 flex justify-center">
                <button
                  onClick={handleTestAgain}
                  className="p-1 px-4 bg-gradient-to-bl from-green-500 to-lime-500 shadow-md rounded-full hover:-translate-y-1 duration-300"
                >
                  Test Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
