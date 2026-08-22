import { useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ScheduleRow {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function calcSchedule(amount: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) {
    const monthly = amount / months;
    const schedule: ScheduleRow[] = [];
    let balance = amount;
    for (let y = 1; y <= years; y++) {
      const yearPayment = monthly * 12;
      balance -= yearPayment;
      schedule.push({ year: y, payment: yearPayment, principal: yearPayment, interest: 0, balance: Math.max(0, balance) });
    }
    return { monthly, totalInterest: 0, totalPayment: amount, schedule };
  }
  const monthly = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - amount;
  const schedule: ScheduleRow[] = [];
  let balance = amount;
  for (let y = 1; y <= years; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const intPart = balance * monthlyRate;
      const prinPart = monthly - intPart;
      yearInterest += intPart;
      yearPrincipal += Math.min(prinPart, balance);
      balance -= prinPart;
      if (balance < 0) balance = 0;
    }
    schedule.push({ year: y, payment: monthly * 12, principal: yearPrincipal, interest: yearInterest, balance: Math.max(0, balance) });
  }
  return { monthly, totalInterest, totalPayment, schedule };
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function LoanCalculator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<number>(50000000);
  const [rate, setRate] = useState<number>(8);
  const [term, setTerm] = useState<number>(20);
  const [result, setResult] = useState<ReturnType<typeof calcSchedule> | null>(null);

  const handleCalc = () => {
    if (amount > 0 && rate >= 0 && term > 0) {
      setResult(calcSchedule(amount, rate, term));
    }
  };
  return (
    <div className="loan-page">
      <div className="loan-container">

        <section className="loan-hero">
          <div className="loan-hero-badge">
            <Calculator size={18} />
            <span>{t('loanCalcTitle')}</span>
          </div>

          <h1 className="loan-hero-title">
            {t('loanCalcTitle')}
          </h1>

          <p className="loan-hero-sub">
            {t('loanCalcSub')}
          </p>
        </section>

        <section className="loan-main-grid">

          <div className="loan-form-card">
            <div className="loan-card-head">
              <div>
                <span className="loan-card-kicker">CALCULATOR</span>
                <h2>Loan Details</h2>
              </div>

              <div className="loan-card-icon">
                <Calculator size={22} />
              </div>
            </div>

            <div className="loan-fields">

              <div className="loan-field">
                <label>{t('loanCalcAmount')}</label>
                <div className="loan-input-wrap">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                  />
                  <span>MMK</span>
                </div>
              </div>

              <div className="loan-field">
                <label>{t('loanCalcRate')}</label>
                <div className="loan-input-wrap">
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    min={0}
                    max={100}
                    step={0.1}
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="loan-field">
                <label>{t('loanCalcTerm')}</label>
                <div className="loan-input-wrap">
                  <input
                    type="number"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    min={1}
                    max={50}
                  />
                  <span>Years</span>
                </div>
              </div>

            </div>

            <button className="loan-calc-btn" onClick={handleCalc}>
              <Calculator size={19} />
              {t('loanCalcBtn')}
            </button>
          </div>

          <div className="loan-preview-card">
            {!result ? (
              <div className="loan-empty-state">
                <div className="loan-empty-icon">
                  <Calculator size={30} />
                </div>

                <h3>Monthly Payment Preview</h3>

                <p>
                  Enter your loan details and calculate to see your estimated payment.
                </p>
              </div>
            ) : (
              <>
                <span className="loan-result-kicker">
                  {t('loanCalcMonthly')}
                </span>

                <div className="loan-monthly-value">
                  {fmt(result.monthly)}
                  <span> MMK</span>
                </div>

                <div className="loan-result-divider"></div>

                <div className="loan-result-mini-grid">
                  <div>
                    <span>{t('loanCalcPrincipal')}</span>
                    <strong>{fmt(amount)} MMK</strong>
                  </div>

                  <div>
                    <span>{t('loanCalcInterest')}</span>
                    <strong>{fmt(result.totalInterest)} MMK</strong>
                  </div>
                </div>
              </>
            )}
          </div>

        </section>

        {result && (
          <section className="loan-summary-section">

            <div className="loan-section-head">
              <span>OVERVIEW</span>
              <h2>{t('loanCalcSummary')}</h2>
            </div>

            <div className="loan-summary-grid">
              <div className="loan-summary-card">
                <span>{t('loanCalcAmount')}</span>
                <strong>{fmt(amount)} MMK</strong>
              </div>

              <div className="loan-summary-card">
                <span>{t('loanCalcInterest')}</span>
                <strong>{fmt(result.totalInterest)} MMK</strong>
              </div>

              <div className="loan-summary-card">
                <span>{t('loanCalcMonthly')}</span>
                <strong>{fmt(result.monthly)} MMK</strong>
              </div>

              <div className="loan-summary-card">
                <span>Total Payment</span>
                <strong>{fmt(result.totalPayment)} MMK</strong>
              </div>
            </div>

            <div className="loan-section-head schedule-head">
              <span>SCHEDULE</span>
              <h2>{t('loanCalcSchedule')}</h2>
            </div>

            <div className="loan-table-card">
              <div className="loan-table-wrap">
                <table className="loan-table">
                  <thead>
                    <tr>
                      <th>{t('loanCalcYear')}</th>
                      <th>Payment</th>
                      <th>{t('loanCalcPrincipal')}</th>
                      <th>{t('loanCalcInterest')}</th>
                      <th>Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.year}>
                        <td>
                          <span className="loan-year-badge">
                            {row.year}
                          </span>
                        </td>
                        <td>{fmt(row.payment)} MMK</td>
                        <td>{fmt(row.principal)} MMK</td>
                        <td>{fmt(row.interest)} MMK</td>
                        <td>{fmt(row.balance)} MMK</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

        <section className="loan-disclaimer">
          <div className="loan-disclaimer-icon">
            <Info size={21} />
          </div>
          <p>{t('loanCalcDisclaimer')}</p>
        </section>

      </div>
    </div>
  );
}
            