'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

export default function ManageQuiz() {
  const t = useTranslations('common');
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [isOpenBars, setIsOpenBars] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
    };

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(
          'id, quizzes(title), question_text, quiz_id, answers(id, answer_text, is_correct)'
        );

      if (error) {
        console.error('Error fetching questions and answers:', error);
        return;
      }
      setQuestions(data);
    };

    checkUser();
    fetchQuestions();
  }, [router]);

  const handleEdit = (quizId) => {
    router.push(`/manage-quiz?id=${quizId}`);
  };

  const handleDelete = async (id) => {
    try {
      const { data: questionData, error: fetchQuestionError } = await supabase
        .from('questions')
        .select('quiz_id')
        .eq('id', id)
        .limit(1)
        .single();

      if (fetchQuestionError) {
        console.error(
          'Error fetching question:',
          fetchQuestionError.message || 'Unknown error'
        );
        return;
      }

      if (!questionData) {
        console.error('No question found for the provided ID');
        return;
      }

      // Delete related answers first
      const { error: deleteAnswersError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', id);

      if (deleteAnswersError) {
        console.error(
          'Error deleting related answers:',
          deleteAnswersError.message || 'Unknown error'
        );
        return;
      }

      // Delete the question
      const { data: questionDeletedData, error: deleteQuestionError } =
        await supabase.from('questions').delete().eq('id', id);

      if (deleteQuestionError) {
        console.error(
          'Error deleting question:',
          deleteQuestionError.message || 'Unknown error'
        );
        return;
      }

      // Now delete the quiz
      const { error: deleteQuizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', questionData.quiz_id);

      if (deleteQuizError) {
        console.error(
          'Error deleting quiz title:',
          deleteQuizError.message || 'Unknown error'
        );
        return;
      }

      console.log('Deleted question and related quiz:', questionDeletedData);

      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.id !== id)
      );
    } catch (err) {
      console.error('Unexpected error while deleting question:', err);
    }
  };
  let locale = Cookies.get('NEXT_LOCALE') || 'en';
  const handleAddQuestion = () => {
    router.push(`/${locale}/manage-quiz`);
  };

  const tableHeader = [
    'Quiz Title',
    'Question',
    'Answer',
    'Correct Answer',
    'Action',
  ];

  return (
    <div>
      <Navbar isOpenBars={isOpenBars} setIsOpenBars={setIsOpenBars} />
      <div className="fixed bottom-0 right-0 sm:right-[4.5rem] m-4"></div>

      <div className="flex justify-center bg-gradient-to-bl from-blue-400 to-purple-400  text-center">
        <div
          className={`sm:mt-16 ${
            isOpenBars ? 'mt-2' : 'mt-16'
          } sm:w-[50rem] bg-slate-50 mb-16 overflow-x-auto mx-4 p-8 shadow-md rounded-md sm:p-[3rem]`}
        >
          <span className="text-2xl font-bold">{t('listQuiz')}</span>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddQuestion();
              }}
            >
              <div className="overflow-x-auto mt-12">
                <table className="text-start w-full overflow-auto">
                  <thead>
                    <tr>
                      {tableHeader.map((i) => (
                        <th className="border-b text-left p-4" key={i}>
                          {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          {t('noQuestions')}
                        </td>
                      </tr>
                    ) : (
                      questions.map(
                        (
                          { id, quizzes, question_text, quiz_id, answers },
                          index
                        ) => {
                          const isLast = index === questions.length - 1;
                          const classes = isLast
                            ? 'p-4'
                            : 'p-4 border-b border-blue-gray-50';
                          return (
                            <tr key={id}>
                              <td className={` ${classes}`}>{quizzes.title}</td>
                              <td className={` ${classes}`}>{question_text}</td>
                              <td className={` ${classes}`}>
                                <select>
                                  {answers.map(({ answer_text }, idx) => (
                                    <option key={idx}>{answer_text}</option>
                                  ))}
                                </select>
                              </td>
                              <td className={classes}>
                                {
                                  answers.find((ans) => ans.is_correct)
                                    ?.answer_text
                                }
                              </td>
                              <td className={`items-center  ${classes}`}>
                                <div className="flex justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(quiz_id)}
                                    className="p-1 px-6 text-white bg-gradient-to-bl hover:-translate-y-1 duration-300 rounded-full shadow-md from-blue-500 to-purple-500"
                                  >
                                    {t('editText')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(id)}
                                    className="p-1 px-4 text-white bg-gradient-to-bl hover:-translate-y-1 duration-300 rounded-full shadow-md from-red-500 to-pink-500"
                                  >
                                    {t('deleteText')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-4 p-4 mt-10">
                <button
                  type="submit"
                  className="p-1 text-white px-4 bg-gradient-to-bl from-green-500 to bg-lime-500 shadow-md rounded-full hover:-translate-y-1 duration-300"
                >
                  {t('addQuestion')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
