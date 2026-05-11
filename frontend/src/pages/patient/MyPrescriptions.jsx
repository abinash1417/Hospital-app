import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FaFileMedical, FaDownload, FaArrowLeft } from 'react-icons/fa';
import jsPDF from 'jspdf';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data } = await API.get('/prescriptions/my');
        setPrescriptions(data);
      } catch (err) {
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const downloadPDF = (prescription) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      doc.setFillColor(14, 165, 233);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('MediCare Hospital', pageWidth / 2, 14, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('No. 45, Galle Road, Colombo 03, Sri Lanka', pageWidth / 2, 22, { align: 'center' });
      doc.text('+94 11 234 5678 | info@medicare.lk', pageWidth / 2, 28, { align: 'center' });
      doc.text('Reg No: MOH/2024/0123', pageWidth / 2, 34, { align: 'center' });

      yPos = 50;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL PRESCRIPTION', pageWidth / 2, yPos, { align: 'center' });

      yPos += 4;
      doc.setDrawColor(14, 165, 233);
      doc.setLineWidth(0.8);
      doc.line(15, yPos, pageWidth - 15, yPos);

      yPos += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('Doctor:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Dr. ${prescription.doctorId?.name || 'N/A'}`,
        40, yPos
      );

      doc.setTextColor(100, 100, 100);
      doc.text('Date:', pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(
        new Date(prescription.createdAt).toLocaleDateString('en-GB'),
        pageWidth - 40, yPos
      );

      yPos += 8;

      doc.setTextColor(100, 100, 100);
      doc.text('Patient:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(prescription.patientId?.name || 'N/A', 40, yPos);

      doc.setTextColor(100, 100, 100);
      doc.text('Ref:', pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(
        prescription.appointmentId?.bookingNumber || 'N/A',
        pageWidth - 40, yPos
      );

      yPos += 8;

      doc.setTextColor(100, 100, 100);
      doc.text('Phone:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(prescription.patientId?.phone || 'N/A', 40, yPos);

      yPos += 4;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(15, yPos, pageWidth - 15, yPos);

      yPos += 10;

      doc.setFillColor(240, 249, 255);
      doc.rect(15, yPos - 4, pageWidth - 30, 20, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 165, 233);
      doc.text('DIAGNOSIS', 20, yPos + 2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      const diagLines = doc.splitTextToSize(
        prescription.diagnosis || '',
        pageWidth - 45
      );
      doc.text(diagLines, 20, yPos + 10);
      yPos += 10 + diagLines.length * 5 + 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 165, 233);
      doc.text('PRESCRIBED MEDICINES', 15, yPos);
      yPos += 6;

      prescription.medicines.forEach((med, i) => {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, yPos, pageWidth - 30, 30, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.text(`${i + 1}. ${med.name || ''}`, 20, yPos + 7);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.text(`Dosage: ${med.dosage || ''}`, 20, yPos + 14);
        doc.text(`Frequency: ${med.frequency || ''}`, 75, yPos + 14);
        doc.text(`Duration: ${med.duration || ''}`, 145, yPos + 14);

        if (med.instructions) {
          doc.setTextColor(14, 165, 233);
          const instrLines = doc.splitTextToSize(
            `Note: ${med.instructions}`,
            pageWidth - 45
          );
          doc.text(instrLines, 20, yPos + 21);
        }

        yPos += 35;
      });

      if (prescription.notes) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }
        yPos += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(14, 165, 233);
        doc.text('ADDITIONAL NOTES', 15, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        const noteLines = doc.splitTextToSize(
          prescription.notes,
          pageWidth - 30
        );
        doc.text(noteLines, 15, yPos);
        yPos += noteLines.length * 5 + 5;
      }

      if (prescription.followUpDate) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        yPos += 5;
        doc.setFillColor(240, 253, 244);
        doc.rect(15, yPos - 4, pageWidth - 30, 14, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(21, 128, 61);
        doc.text(
          `Follow-up Date: ${prescription.followUpDate}`,
          20, yPos + 4
        );
        yPos += 18;
      }

      yPos += 10;
      if (yPos > pageHeight - 35) {
        doc.addPage();
        yPos = 20;
      }
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(pageWidth - 75, yPos, pageWidth - 15, yPos);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Dr. ${prescription.doctorId?.name || ''}`,
        pageWidth - 45, yPos + 5,
        { align: 'center' }
      );
      doc.text(
        'Authorized Signature',
        pageWidth - 45, yPos + 11,
        { align: 'center' }
      );

      const footerY = pageHeight - 12;
      doc.setFillColor(14, 165, 233);
      doc.rect(0, footerY - 6, pageWidth, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'This is a computer-generated prescription. Valid only with authorized signature.',
        pageWidth / 2,
        footerY + 2,
        { align: 'center' }
      );

      const filename = `prescription-${prescription.appointmentId?.bookingNumber || Date.now()}.pdf`;
      doc.save(filename);
      toast.success('Prescription downloaded!');

    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition">
          <FaArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Prescriptions
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and download your prescriptions
          </p>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
          <FaFileMedical className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No prescriptions yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Prescriptions will appear here after your doctor writes them
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div key={prescription._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center">
                    <FaFileMedical className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Dr. {prescription.doctorId?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(prescription.createdAt)
                        .toLocaleDateString('en-GB')}
                    </p>
                    {prescription.appointmentId?.bookingNumber && (
                      <p className="text-xs text-green-600 font-medium">
                        Ref: {prescription.appointmentId.bookingNumber}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => downloadPDF(prescription)}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition">
                  <FaDownload size={13} />
                  Download PDF
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-1">
                  DIAGNOSIS
                </p>
                <p className="text-gray-800 text-sm">
                  {prescription.diagnosis}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Medicines ({prescription.medicines.length})
                </p>
                {prescription.medicines.map((med, i) => (
                  <div key={i}
                    className="bg-gray-50 rounded-xl p-3">
                    <p className="font-medium text-gray-800 text-sm">
                      {i + 1}. {med.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {med.dosage} • {med.frequency} • {med.duration}
                    </p>
                    {med.instructions && (
                      <p className="text-xs text-primary-600 mt-1">
                        📝 {med.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {prescription.notes && (
                  <div className="bg-amber-50 rounded-xl p-3 flex-1 min-w-0">
                    <p className="text-xs text-amber-600 font-medium mb-1">
                      NOTES
                    </p>
                    <p className="text-gray-700 text-sm">
                      {prescription.notes}
                    </p>
                  </div>
                )}
                {prescription.followUpDate && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">
                      FOLLOW-UP DATE
                    </p>
                    <p className="text-gray-700 text-sm font-bold">
                      {prescription.followUpDate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;