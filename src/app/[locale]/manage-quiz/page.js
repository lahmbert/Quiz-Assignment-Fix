'use client';

import Navbar from '@/components/navbar';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManageQuiz() {
  const t = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpenBars, setIsOpenBars] = useState(false);

  const quizId = searchParams.get('id');
  let locale = Cookies.get('NEXT_LOCALE') || 'en';

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push(`/${locale}/login`);
        return;
      }
    };

    checkUser();
  }, [router]);

  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questions: '', answer: ['', '', '', ''], correctAnswer: 0 },
  ]);

  const loadQuizData = async () => {
    if (quizId) {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('id', quizId)
        .single();

      if (quizError || !quizData) {
        console.error('Error fetching quiz:', quizError);
        return;
      }
      setQuizTitle(quizData.title);

      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('id, question_text, answers (id, answer_text, is_correct)')
        .eq('quiz_id', quizData.id);

      if (questionError || !questionData) {
        console.error('Error fetching questions:', questionError);
        return;
      }

      const formattedQuestions = questionData.map((q) => ({
        id: q.id,
        questions: q.question_text,
        answer: q.answers.map((a) => a.answer_text),
        correctAnswer: q.answers.findIndex((a) => a.is_correct),
      }));

      setQuestions(formattedQuestions);
    }
  };

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  const handleAddQuestions = () => {
    setQuestions([
      ...questions,
      { questions: '', answer: ['', '', '', ''], correctAnswer: 0 },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    let updatedQuizId;
    if (quizId) {
      // Delete associated questions before updating the quiz
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizId);

      if (questionError) {
        console.error('Error deleting questions:', questionError);
        return;
      }

      const { data: updatedQuiz, error: updateQuizError } = await supabase
        .from('quizzes')
        .update({ title: quizTitle, user_id: userId })
        .eq('id', quizId)
        .select();

      if (updateQuizError || !updatedQuiz) {
        console.error('Error updating quiz:', updateQuizError);
        return;
      }
      updatedQuizId = updatedQuiz[0].id;
    } else {
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([{ title: quizTitle, user_id: userId }])
        .select();

      if (quizError || !quiz || quiz.length === 0) {
        console.error('Error inserting quiz title:', quizError);
        return;
      }
      updatedQuizId = quiz[0].id;
    }

    for (const q of questions) {
      let questionId;

      if (q.id) {
        const { data: updatedQuestion, error: questionError } = await supabase
          .from('questions')
          .update({ question_text: q.questions })
          .eq('id', q.id)
          .select();
        if (questionError || !updatedQuestion) {
          console.error('Error updating question:', questionError);
          return;
        }
        questionId = updatedQuestion[0].id;
      } else {
        const { data: newQuestion, error: questionError } = await supabase
          .from('questions')
          .insert([{ question_text: q.questions, quiz_id: updatedQuizId }])
          .select();
        if (questionError || !newQuestion || newQuestion.length === 0) {
          console.error('Error inserting question:', questionError);
          return;
        }
        questionId = newQuestion[0].id;
      }

      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId);

      if (deleteError) {
        console.error('Error deleting old answers:', deleteError);
        return;
      }

      for (const [index, answer] of q.answer.entries()) {
        if (answer.trim() === '') continue;

        const { data: answerData, error: answerError } = await supabase
          .from('answers')
          .insert([
            {
              question_id: questionId,
              answer_text: answer,
              is_correct: index === q.correctAnswer,
            },
          ])
          .select();

        if (answerError || !answerData) {
          console.error('Error inserting answer:', answerError);
          return;
        }
      }
    }
    let locale = Cookies.get('NEXT_LOCALE') || 'en';
    setQuizTitle('');
    setQuestions([
      { questions: '', answer: ['', '', '', ''], correctAnswer: 0 },
    ]);
    router.push(`/${locale}/list-quiz`);
  };

  return (
    <div className="bg-gradient-to-bl from-blue-400 to-purple-400">
      <Navbar isOpenBars={isOpenBars} setIsOpenBars={setIsOpenBars} />
      <div
        className={`${
          isOpenBars ? 'mt-2' : 'mt-16'
        } justify-center pb-16 text-center flex`}
      >
        <div className="sm:w-[40rem] mx-4 p-8 bg-slate-50 rounded-md flex flex-col shadow-lg sm:p-[3rem]">
          <div className="text-2xl font-bold">{t('manageQuestion')}</div>
          <div className="sm:mt-10">
            <form onSubmit={handleSubmit} className="w-full text-start">
              <div className="flex flex-col py-4 gap-2">
                <label htmlFor="quizTitle">{t('quizTitle')}</label>
                <input
                  className="focus:outline-none border rounded-md p-1 ml-1"
                  type="text"
                  id="quizTitle"
                  name="quizTitle"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
              </div>

              {questions.map((q, index) => (
                <div className="w-full" key={index}>
                  <div className="flex w-full flex-col py-4 gap-2">
                    <label htmlFor="questions">{t('questionText')}</label>
                    <input
                      className="focus:outline-none border rounded-md p-1 ml-1"
                      type="text"
                      id="questions"
                      name="questions"
                      value={q.questions}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].questions = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 w-full gap-2">
                    {q.answer.map((answer, i) => (
                      <div key={i} className="flex flex-col gap-2 py-2">
                        <label className="ml-2" htmlFor={`answer-${i}`}>
                          {t('answerText')} {i + 1}
                        </label>
                        <input
                          type="text"
                          id={`answer-${i}`}
                          name="answer"
                          value={answer}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].answer[i] = e.target.value;
                            setQuestions(newQuestions);
                          }}
                          className="focus:outline-none border rounded-md p-1 ml-1"
                        />
                      </div>
                    ))}
                  </div>
                  <select
                    className="p-1 rounded-md w-full my-6 border focus:outline-slate-500"
                    value={q.correctAnswer >= 0 ? q.correctAnswer : 0}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].correctAnswer = parseInt(
                        e.target.value
                      );
                      setQuestions(newQuestions);
                    }}
                  >
                    <option value="" disabled>
                      Select Correct Answer
                    </option>
                    {q.answer.map((_, i) => (
                      <option key={i} value={i}>
                        Answer {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="flex mt-10 justify-end gap-4 px-4">
                {!quizId && (
                  <button
                    type="button"
                    onClick={handleAddQuestions}
                    className=" bg-gradient-to-bl p-2 px-4 from-blue-500 to-purple-500 hover:-translate-y-1 duration-300 text-white rounded-full shadow-md"
                  >
                    {t('addQuestion')}
                  </button>
                )}

                <button
                  type="submit"
                  className=" p-2 px-6 bg-gradient-to-bl from-green-500 to-lime-500 hover:-translate-y-1 duration-300 text-white rounded-full shadow-md"
                >
                  {quizId ? t('updateQuiz') : t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
