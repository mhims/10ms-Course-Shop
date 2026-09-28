import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useCourseContext } from '../context/CourseContext';
import { Review } from '../types';

export const ReviewPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { reviews, addReview, courses } = useCourseContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [studentName, setStudentName] = useState('');
  const [institution, setInstitution] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !comment.trim()) return;

    const matchedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      courseId: matchedCourse.id,
      courseSlug: matchedCourse.slug,
      courseTitle: matchedCourse.title,
      studentName: studentName.trim(),
      studentInstitution: institution.trim() || 'শিক্ষার্থী',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    addReview(newRev);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowAddModal(false);
      setStudentName('');
      setInstitution('');
      setComment('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ভেরিফাইড মতামত</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">শিক্ষার্থীদের অভিজ্ঞতা ও রিভিউ</h1>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            ১০ মিনিট স্কুলের বিভিন্ন কোর্সে পড়াশোনা করে শিক্ষার্থীরা কী বলছেন তা জেনে নিন সরাসরি।
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto px-5 py-3 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>আপনার রিভিউ দিন</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                {rev.verified && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>ভেরিফাইড স্টুডেন্ট</span>
                  </span>
                )}
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </blockquote>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{rev.studentName}</h4>
                <p className="text-[11px] text-slate-500">{rev.studentInstitution}</p>
              </div>

              <div
                onClick={() => onNavigate(`/${rev.courseSlug}`)}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>কোর্স: {rev.courseTitle}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">আপনার রিভিউ যুক্ত করুন</h3>

            {submitted ? (
              <div className="p-6 text-center text-emerald-600 font-bold text-sm space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto" />
                <p>ধন্যবাদ! আপনার মূল্যবান রিভিউ সফলভাবে যুক্ত হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কোর্স নির্বাচন করুন</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {courses.slice(0, 30).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">আপনার নাম</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="যেমন: সাকিব হাসান"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">স্কুল/কলেজ/প্রতিষ্ঠান</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="যেমন: ঢাকা কলেজ"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">রেটিং (১ থেকে ৫)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-lg border text-xs font-bold ${
                          rating >= star
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">আপনার অভিজ্ঞতা / মন্তব্য</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="কোর্সের শিক্ষাদান ও আপনার প্রস্তুতির অনুভূতি লিখুন..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                  >
                    সাবমিট করুন
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
