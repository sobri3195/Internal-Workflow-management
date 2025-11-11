import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function DocumentView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery(['document', id], async () => {
    const response = await axios.get(`/api/documents/${id}`);
    return response.data;
  });

  const addCommentMutation = useMutation(
    async (commentText) => {
      await axios.post(`/api/review/${id}/comment`, { comment: commentText });
    },
    {
      onSuccess: () => {
        toast.success('Komentar berhasil ditambahkan');
        setComment('');
        queryClient.invalidateQueries(['document', id]);
      },
    }
  );

  const submitDocumentMutation = useMutation(
    async () => {
      await axios.post(`/api/documents/${id}/submit`);
    },
    {
      onSuccess: () => {
        toast.success('Dokumen berhasil diajukan');
        queryClient.invalidateQueries(['document', id]);
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;

  const doc = data.document;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-900"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{doc.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Nomor: {doc.document_number || 'Belum ada'}
            </p>
          </div>
          <div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              doc.status === 'archived' ? 'bg-green-100 text-green-800' :
              doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {doc.status}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Jenis Dokumen</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doc.document_type}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Unit Kerja</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doc.unit_kerja}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doc.description || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tanggal Dibuat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm')}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Pembuat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doc.submitter_name}</dd>
            </div>
          </dl>
        </div>
      </div>

      {data.attachments?.length > 0 && (
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Lampiran</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {data.attachments.map((attachment) => (
              <li key={attachment.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-600">{attachment.original_filename}</div>
                  <a
                    href={`/api/attachments/${attachment.id}/download`}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Komentar</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="space-y-4">
            {data.comments?.map((c) => (
              <div key={c.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{c.user_name}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(c.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{c.comment}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tambahkan komentar..."
            />
            <button
              onClick={() => comment && addCommentMutation.mutate(comment)}
              className="mt-2 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
            >
              Kirim Komentar
            </button>
          </div>
        </div>
      </div>

      {(doc.status === 'draft' || doc.status === 'revision') && doc.submitter_id === user?.id && (
        <div className="mt-6">
          <button
            onClick={() => submitDocumentMutation.mutate()}
            className="w-full bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700"
          >
            Submit untuk Review
          </button>
        </div>
      )}
    </div>
  );
}
