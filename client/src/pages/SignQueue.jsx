import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function SignQueue() {
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [signatureType, setSignatureType] = useState('digital');
  const [signatureData, setSignatureData] = useState('');

  const { data, isLoading } = useQuery('signQueue', async () => {
    const response = await axios.get('/api/documents?status=sign');
    return response.data;
  });

  const signMutation = useMutation(
    async ({ docId, signature_type, signature_data }) => {
      await axios.post(`/api/sign/${docId}/sign`, {
        signature_type,
        signature_data,
        certificate_info: 'Digital signature'
      });
    },
    {
      onSuccess: () => {
        toast.success('Dokumen berhasil ditandatangani');
        setSelectedDoc(null);
        setSignatureData('');
        queryClient.invalidateQueries('signQueue');
      },
    }
  );

  const handleSign = () => {
    signMutation.mutate({
      docId: selectedDoc,
      signature_type: signatureType,
      signature_data: signatureData || 'Digital Signature'
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sign Queue</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokumen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.document_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    Lihat
                  </Link>
                  <button
                    onClick={() => setSelectedDoc(doc.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Sign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium mb-4">Tanda Tangan Dokumen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Tanda Tangan</label>
                <select
                  value={signatureType}
                  onChange={(e) => setSignatureType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="digital">Digital Signature</option>
                  <option value="electronic">Electronic Signature</option>
                  <option value="biometric">Biometric Signature</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data Tanda Tangan (opsional)</label>
                <textarea
                  value={signatureData}
                  onChange={(e) => setSignatureData(e.target.value)}
                  rows={3}
                  placeholder="Masukkan data tanda tangan atau sertifikat"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="bg-gray-300 py-2 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleSign}
                  className="bg-blue-600 py-2 px-4 rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Tanda Tangani
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
