import { useState } from 'react'
import axios from 'axios'

function AIClaimPage() {
  const [loading, setLoading] = useState(false)
  const [claimForm, setClaimForm] = useState({
    claimId: '',
    patientName: '',
    policyNumber: '',
    billingCode: '',
    documents: ''
  })
  const [claimResult, setClaimResult] = useState(null)

  const processClaim = async () => {
    const payload = {
      ...claimForm,
      documents: claimForm.documents ? claimForm.documents.split(',') : []
    }

    try {
      setLoading(true)

      const res = await axios.post('http://localhost:8899/api/claims/process', payload)
      setClaimResult(res.data)
    } catch (err) {
      console.error(err)
      alert('Claim processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Agentic AI Claim Validator</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <input
            placeholder="Claim ID"
            value={claimForm.claimId}
            onChange={(e) => setClaimForm({ ...claimForm, claimId: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3"
          />

          <input
            placeholder="Patient Name"
            value={claimForm.patientName}
            onChange={(e) => setClaimForm({ ...claimForm, patientName: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3"
          />

          <input
            placeholder="Policy Number"
            value={claimForm.policyNumber}
            onChange={(e) => setClaimForm({ ...claimForm, policyNumber: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3"
          />

          <input
            placeholder="Billing Code (B001,B002)"
            value={claimForm.billingCode}
            onChange={(e) => setClaimForm({ ...claimForm, billingCode: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3"
          />

          <input
            placeholder="Documents (comma separated)"
            value={claimForm.documents}
            onChange={(e) => setClaimForm({ ...claimForm, documents: e.target.value })}
            className="border p-3 rounded-lg w-full mb-4"
          />

          <button
            onClick={processClaim}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg w-full"
          >
            {loading ? 'Processing...' : 'Validate Claim'}
          </button>
        </div>

        <div>
          {claimResult && (
            <div className="p-4 border rounded-xl bg-gray-50">
              <h3 className="text-xl font-bold mb-2">Status: {claimResult.status}</h3>

              {claimResult.errors && (
                <>
                  <h4 className="font-semibold mt-3">Errors:</h4>
                  <ul className="list-disc ml-6">
                    {claimResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </>
              )}

              {claimResult.explanations && (
                <>
                  <h4 className="font-semibold mt-3">AI Explanations:</h4>
                  <ul className="list-disc ml-6">
                    {claimResult.explanations.map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIClaimPage
