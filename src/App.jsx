import { useMemo, useState } from 'react'

function App() {
  const [ctc, setCtc] = useState('')
  const [regime, setRegime] = useState('new')
  const [deduction, setDeduction] = useState('')
  const [result, setResult] = useState(null)

  const formatIndianNumber = (value) => {
    if (value === '' || value === null || value === undefined) return ''
    return Number(value).toLocaleString('en-IN')
  }

  const parseNumber = (value) => {
    return value.replace(/,/g, '').replace(/[^\d]/g, '')
  }

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    })
  }

  const formatLPA = (value) => {
    const amount = Number(value || 0) / 100000
    return `${amount.toFixed(amount % 1 === 0 ? 0 : 1)} LPA`
  }

  const handleCtcChange = (e) => {
    setCtc(parseNumber(e.target.value))
  }

  const handleDeductionChange = (e) => {
    setDeduction(parseNumber(e.target.value))
  }

  const calculateByRegime = (annualCtc, selectedRegime, deductionAmount = 0) => {
    const standardDeduction = 50000
    let taxableIncome = annualCtc - standardDeduction

    if (selectedRegime === 'old') {
      taxableIncome -= deductionAmount
    }

    if (taxableIncome < 0) taxableIncome = 0

    let baseTax = 0
    let tempTaxable = taxableIncome

    if (selectedRegime === 'new') {
      if (tempTaxable > 1500000) {
        baseTax += (tempTaxable - 1500000) * 0.3
        tempTaxable = 1500000
      }
      if (tempTaxable > 1200000) {
        baseTax += (tempTaxable - 1200000) * 0.2
        tempTaxable = 1200000
      }
      if (tempTaxable > 900000) {
        baseTax += (tempTaxable - 900000) * 0.15
        tempTaxable = 900000
      }
      if (tempTaxable > 600000) {
        baseTax += (tempTaxable - 600000) * 0.1
        tempTaxable = 600000
      }
      if (tempTaxable > 300000) {
        baseTax += (tempTaxable - 300000) * 0.05
      }
    } else {
      if (tempTaxable > 1000000) {
        baseTax += (tempTaxable - 1000000) * 0.3
        tempTaxable = 1000000
      }
      if (tempTaxable > 500000) {
        baseTax += (tempTaxable - 500000) * 0.2
        tempTaxable = 500000
      }
      if (tempTaxable > 250000) {
        baseTax += (tempTaxable - 250000) * 0.05
      }
    }

    const cess = baseTax * 0.04
    const totalTax = baseTax + cess
    const netAnnualIncome = annualCtc - totalTax
    const monthlyTakeHome = netAnnualIncome / 12
    const dailyIncome = netAnnualIncome / 365

    return {
      annualCtc,
      taxableIncome,
      baseTax,
      cess,
      totalTax,
      netAnnualIncome,
      monthlyTakeHome,
      dailyIncome,
      lpa: annualCtc / 100000,
    }
  }

  const calculateTax = () => {
    const annualCtc = Number(ctc) || 0
    const deductionAmount = Number(deduction) || 0

    if (!annualCtc) {
      setResult(null)
      return
    }

    const activeResult = calculateByRegime(annualCtc, regime, deductionAmount)
    const newRegimeResult = calculateByRegime(annualCtc, 'new', deductionAmount)
    const oldRegimeResult = calculateByRegime(annualCtc, 'old', deductionAmount)

    const betterRegime =
      oldRegimeResult.totalTax < newRegimeResult.totalTax ? 'old' : 'new'

    const savings = Math.abs(oldRegimeResult.totalTax - newRegimeResult.totalTax)

    setResult({
      active: activeResult,
      newRegime: newRegimeResult,
      oldRegime: oldRegimeResult,
      betterRegime,
      savings,
      deductionAmount,
      selectedRegime: regime,
    })
  }

  const ctcPreview = useMemo(() => {
    return ctc ? formatLPA(ctc) : ''
  }, [ctc])

  return (
    <div className="app-wrapper">
      <div className="container py-5">
        <div className="hero-section text-center mb-5">
          <span className="hero-badge">Smart Salary Planner</span>
          <h1 className="hero-title">TakeHomeAI</h1>
          <p className="hero-subtitle">
            Calculate tax, compare regimes, and understand your real take-home salary with a cleaner modern experience.
          </p>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-xl-5 col-lg-6">
            <div className="card calculator-card">
              <div className="card-body p-4 p-md-5">
                <div className="section-head mb-4">
                  <h2 className="section-title mb-2">Salary Calculator</h2>
                  <p className="section-text mb-0">
                    Enter your salary details and get a complete tax breakdown.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="form-label">Annual CTC (₹)</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter annual CTC"
                    value={formatIndianNumber(ctc)}
                    onChange={handleCtcChange}
                  />
                  <div className="helper-row">
                    <small className="text-muted">
                      Example: 12,00,000 or 25,50,000
                    </small>
                    {ctcPreview && <span className="lpa-pill">{ctcPreview}</span>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Tax Regime</label>
                  <select
                    className="form-select form-select-lg"
                    value={regime}
                    onChange={(e) => setRegime(e.target.value)}
                  >
                    <option value="new">New Regime</option>
                    <option value="old">Old Regime</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label">80C Deduction (Old Regime)</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter deduction amount"
                    value={formatIndianNumber(deduction)}
                    onChange={handleDeductionChange}
                    disabled={regime === 'new'}
                  />
                  <small className="text-muted">Example: 1,50,000</small>
                </div>

                <button
                  className="btn btn-gradient btn-lg w-100"
                  onClick={calculateTax}
                >
                  Calculate Now
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-7 col-lg-6">
            {result ? (
              <div className="results-stack">
                <div className="result-hero-card">
                  <div>
                    <p className="eyebrow mb-2">Selected Regime</p>
                    <h3 className="mb-1 text-capitalize">
                      {result.selectedRegime} Regime
                    </h3>
                    <p className="mb-0 result-subtext">
                      Here’s your take-home summary with cess included.
                    </p>
                  </div>

                  <div className="result-hero-amount">
                    <span>Monthly Take Home</span>
                    <strong>₹{formatCurrency(result.active.monthlyTakeHome)}</strong>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="info-card stat-card">
                      <span className="stat-label">Annual CTC</span>
                      <h4>₹{formatCurrency(result.active.annualCtc)}</h4>
                      <p>{formatLPA(result.active.annualCtc)}</p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="info-card stat-card">
                      <span className="stat-label">Total Tax</span>
                      <h4>₹{formatCurrency(result.active.totalTax)}</h4>
                      <p>Including 4% cess</p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="info-card stat-card">
                      <span className="stat-label">Daily Income</span>
                      <h4>₹{formatCurrency(result.active.dailyIncome)}</h4>
                      <p>Based on net annual income</p>
                    </div>
                  </div>
                </div>

                <div className="card details-card mb-4">
                  <div className="card-body p-4">
                    <div className="section-head mb-3">
                      <h3 className="details-title mb-1">Tax Breakdown</h3>
                      <p className="section-text mb-0">
                        A full summary of how your salary is calculated.
                      </p>
                    </div>

                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <span>Annual CTC</span>
                        <strong>₹{formatCurrency(result.active.annualCtc)}</strong>
                      </div>
                      <div className="breakdown-item">
                        <span>Standard Deduction</span>
                        <strong>₹50,000</strong>
                      </div>
                      {result.selectedRegime === 'old' && (
                        <div className="breakdown-item">
                          <span>80C Deduction</span>
                          <strong>₹{formatCurrency(result.deductionAmount)}</strong>
                        </div>
                      )}
                      <div className="breakdown-item">
                        <span>Taxable Income</span>
                        <strong>₹{formatCurrency(result.active.taxableIncome)}</strong>
                      </div>
                      <div className="breakdown-item">
                        <span>Base Tax</span>
                        <strong>₹{formatCurrency(result.active.baseTax)}</strong>
                      </div>
                      <div className="breakdown-item">
                        <span>Health & Education Cess (4%)</span>
                        <strong>₹{formatCurrency(result.active.cess)}</strong>
                      </div>
                      <div className="breakdown-item total-row">
                        <span>Total Tax</span>
                        <strong>₹{formatCurrency(result.active.totalTax)}</strong>
                      </div>
                      <div className="breakdown-item total-row highlight-row">
                        <span>Net Annual Income</span>
                        <strong>₹{formatCurrency(result.active.netAnnualIncome)}</strong>
                      </div>
                      <div className="breakdown-item total-row highlight-row">
                        <span>Monthly Take Home</span>
                        <strong>₹{formatCurrency(result.active.monthlyTakeHome)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card details-card">
                  <div className="card-body p-4">
                    <div className="section-head mb-3">
                      <h3 className="details-title mb-1">Old vs New Comparison</h3>
                      <p className="section-text mb-0">
                        Compare both regimes and choose the smarter option.
                      </p>
                    </div>

                    <div className="comparison-grid">
                      <div className="comparison-box">
                        <span>Old Regime Tax</span>
                        <strong>₹{formatCurrency(result.oldRegime.totalTax)}</strong>
                        <small>
                          Monthly: ₹{formatCurrency(result.oldRegime.monthlyTakeHome)}
                        </small>
                      </div>

                      <div className="comparison-box">
                        <span>New Regime Tax</span>
                        <strong>₹{formatCurrency(result.newRegime.totalTax)}</strong>
                        <small>
                          Monthly: ₹{formatCurrency(result.newRegime.monthlyTakeHome)}
                        </small>
                      </div>
                    </div>

                    <div className="winner-box mt-3">
                      <p className="mb-1">
                        Better choice:{' '}
                        <strong className="text-capitalize">
                          {result.betterRegime} Regime
                        </strong>
                      </p>
                      <p className="mb-0">
                        Estimated savings: <strong>₹{formatCurrency(result.savings)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">₹</div>
                <h3>Ready to calculate</h3>
                <p>
                  Enter your salary details on the left to view tax breakdown,
                  comparison, monthly take-home, and LPA insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App