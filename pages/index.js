import { useEffect, useMemo, useRef, useState } from 'react';

export default function FinancialFreedomTracker() {
  const storageKey = 'financial-freedom-tracker';

  const [financialData, setFinancialData] = useState({
    income: '',
    emergencyFund: 0,
    houseDeposit: 0,
  });

  const [expenses, setExpenses] = useState([
    { name: 'Rent', amount: '' },
  ]);

  const [debts, setDebts] = useState([
    { name: 'Credit Card', amount: '' },
  ]);

  const [generatedPlan, setGeneratedPlan] =
    useState(null);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const sections = [
    {
      title: 'Month 1 Payday Checklist',
      items: [
        'Rent — R1,500',
        'Mom Rent — R2,500',
        'Electricity — R500',
        'WiFi — R551',
        'Haircut — R400',
        'Funeral Cover — R250',
        'Sesi Debt Cleared — R150',
        'Ben Debt Cleared — R800',
        'Masingita Debt Cleared — R1,150',
        'Credit Card Minimum — R2,800',
        'Credit Card Extra — R5,000',
        'Emergency Fund — R1,799',
        'Save Proof Screenshots',
        'Verify Bank Balance',
      ],
    },
    {
      title: 'Month 2 Payday Checklist',
      items: [
        'All Bills Paid',
        'Credit Card Payment — R7,800',
        'Emergency Fund Contribution',
        'Keep Buffer Untouched',
        'Verify Credit Card Balance',
      ],
    },
    {
      title: 'Month 3 Payday Checklist',
      items: [
        'Final Credit Card Payment',
        'Get R0 Debt Screenshot',
        'Emergency Fund Boost',
        'Give Notice',
        'Confirm 2-Person Move',
        'Complete Debt-Free Status',
      ],
    },
    {
      title: 'Month 4+ Financial Stability',
      items: [
        'Rent-to-buy Payment',
        'Food Budget Managed',
        'Transport Budget Managed',
        'Emergency Fund Savings',
        'TFSA Investment',
        'House Deposit Savings',
        'Auto Debit Savings Active',
      ],
    },
  ];

  const allItems = sections.flatMap((s) => s.items);

  const [checked, setChecked] = useState({});
  const [proofs, setProofs] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setChecked(JSON.parse(saved));
    }

    const savedProofs = localStorage.getItem(
      `${storageKey}-proofs`
    );

    if (savedProofs) {
      setProofs(JSON.parse(savedProofs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(checked)
    );
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(
      `${storageKey}-proofs`,
      JSON.stringify(proofs)
    );
  }, [proofs]);

  const completedCount = useMemo(() => {
    return Object.values(checked).filter(Boolean).length;
  }, [checked]);

  const progress = Math.round(
    (completedCount / allItems.length) * 100
  );

  const handleProofUpload = (key, file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProofs((prev) => ({
        ...prev,
        [key]: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const toggleItem = (key) => {
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      style={{
        padding: '20px',
        background: '#f3f4f6',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* FINANCIAL PLANNER FORM */}

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '24px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2>Build Your Financial Plan</h2>

          <div style={{ marginTop: '20px' }}>
            <label>Monthly Income</label>

            <input
              type="number"
              placeholder="19400"
              value={financialData.income}
              onChange={(e) =>
                setFinancialData({
                  ...financialData,
                  income: Number(e.target.value),
                })
              }
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                marginTop: '8px',
              }}
            />
          </div>

          {/* EXPENSES */}

          <div style={{ marginTop: '24px' }}>
            <h3>Expenses</h3>

            {expenses.map((expense, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <input
                  placeholder="Expense Name"
                  value={expense.name}
                  onChange={(e) => {
                    const updated = [...expenses];
                    updated[idx].name = e.target.value;
                    setExpenses(updated);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                  }}
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={expense.amount}
                  onChange={(e) => {
                    const updated = [...expenses];
                    updated[idx].amount = Number(
                      e.target.value
                    );
                    setExpenses(updated);
                  }}
                  style={{
                    width: '120px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>
            ))}

            <button
              onClick={() =>
                setExpenses([
                  ...expenses,
                  { name: '', amount: '' },
                ])
              }
              style={{
                marginTop: '12px',
                border: 'none',
                background: 'black',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              + Add Expense
            </button>
          </div>

          {/* DEBTS */}

          <div style={{ marginTop: '24px' }}>
            <h3>Debts</h3>

            {debts.map((debt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <input
                  placeholder="Debt Name"
                  value={debt.name}
                  onChange={(e) => {
                    const updated = [...debts];
                    updated[idx].name = e.target.value;
                    setDebts(updated);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                  }}
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={debt.amount}
                  onChange={(e) => {
                    const updated = [...debts];
                    updated[idx].amount = Number(
                      e.target.value
                    );
                    setDebts(updated);
                  }}
                  style={{
                    width: '120px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>
            ))}

            <button
              onClick={() =>
                setDebts([
                  ...debts,
                  { name: '', amount: '' },
                ])
              }
              style={{
                marginTop: '12px',
                border: 'none',
                background: 'black',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              + Add Debt
            </button>
          </div>

          {/* GENERATE PLAN BUTTON */}

          <button
            onClick={() => {
              const totalExpenses = expenses.reduce(
                (sum, e) => sum + (e.amount || 0),
                0
              );

              const totalDebt = debts.reduce(
                (sum, d) => sum + (d.amount || 0),
                0
              );

              const freeCash =
                financialData.income - totalExpenses;

              setGeneratedPlan({
                totalExpenses,
                totalDebt,
                freeCash,
              });
            }}
            style={{
              width: '100%',
              marginTop: '30px',
              border: 'none',
              background: 'black',
              color: 'white',
              padding: '16px',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Generate Financial Plan
          </button>
        </div>

        {/* GENERATED PLAN */}

        {generatedPlan && (
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '24px',
              marginBottom: '20px',
              boxShadow:
                '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <h2>Generated Financial Plan</h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  background: '#f9fafb',
                  padding: '18px',
                  borderRadius: '16px',
                }}
              >
                <p>Total Expenses</p>
                <h2>
                  {formatCurrency(
                    generatedPlan.totalExpenses
                  )}
                </h2>
              </div>

              <div
                style={{
                  background: '#f9fafb',
                  padding: '18px',
                  borderRadius: '16px',
                }}
              >
                <p>Total Debt</p>
                <h2>
                  {formatCurrency(
                    generatedPlan.totalDebt
                  )}
                </h2>
              </div>

              <div
                style={{
                  background: '#f9fafb',
                  padding: '18px',
                  borderRadius: '16px',
                }}
              >
                <p>Free Cash</p>
                <h2>
                  {formatCurrency(
                    generatedPlan.freeCash
                  )}
                </h2>
              </div>
            </div>

            <div
              style={{
                marginTop: '24px',
                background: '#f9fafb',
                padding: '18px',
                borderRadius: '16px',
              }}
            >
              <h3>Suggested Strategy</h3>

              <p>
                {generatedPlan.totalDebt > 0
                  ? 'Prioritize debt elimination aggressively before increasing lifestyle spending.'
                  : 'You are ready to aggressively build wealth and investments.'}
              </p>
            </div>
          </div>
        )}

        {/* DASHBOARD */}

        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h1 style={{ margin: 0 }}>
            Financial Freedom Tracker
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: '8px',
            }}
          >
            Debt Elimination • Stability • Home Ownership
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <div
              style={{
                background: '#f9fafb',
                padding: '18px',
                borderRadius: '18px',
              }}
            >
              <div style={{ fontSize: '24px' }}>
                💰
              </div>
              <p>Monthly Income</p>
              <h2>
                {formatCurrency(financialData.income)}
              </h2>
            </div>

            <div
              style={{
                background: '#f9fafb',
                padding: '18px',
                borderRadius: '18px',
              }}
            >
              <div style={{ fontSize: '24px' }}>
                💳
              </div>
              <p>Total Debt</p>
              <h2>
                {generatedPlan
                  ? formatCurrency(
                      generatedPlan.totalDebt
                    )
                  : 'R0'}
              </h2>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>Master Progress</span>
              <strong>{progress}%</strong>
            </div>

            <div
              style={{
                background: '#e5e7eb',
                height: '14px',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '14px',
                  background: 'black',
                }}
              />
            </div>
          </div>
        </div>

        {/* CHECKLISTS */}

        {sections.map((section, index) => {
          const sectionProgress = Math.round(
            (section.items.filter(
              (_, idx) =>
                checked[`${section.title}-${idx}`]
            ).length /
              section.items.length) *
              100
          );

          return (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <h2>{section.title}</h2>

              <div style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>Section Progress</span>
                  <strong>{sectionProgress}%</strong>
                </div>

                <div
                  style={{
                    background: '#e5e7eb',
                    height: '10px',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${sectionProgress}%`,
                      height: '10px',
                      background: 'black',
                    }}
                  />
                </div>
              </div>

              {section.items.map((item, idx) => {
                const itemKey = `${section.title}-${idx}`;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      marginTop: '10px',
                      background: checked[itemKey]
                        ? '#dcfce7'
                        : '#f9fafb',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[itemKey]}
                        onChange={() =>
                          toggleItem(itemKey)
                        }
                        disabled={!proofs[itemKey]}
                      />

                      <span
                        style={{
                          textDecoration: checked[itemKey]
                            ? 'line-through'
                            : 'none',
                          fontWeight: '500',
                          flex: 1,
                        }}
                      >
                        {item}
                      </span>
                    </label>

                    <div style={{ marginTop: '12px' }}>
                      <input
                        ref={(el) =>
                          (fileInputRefs.current[itemKey] =
                            el)
                        }
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          handleProofUpload(
                            itemKey,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          fileInputRefs.current[
                            itemKey
                          ]?.click()
                        }
                        style={{
                          border: 'none',
                          background: 'black',
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {proofs[itemKey]
                          ? '✅ Proof Uploaded'
                          : '📸 Upload Proof'}
                      </button>
                    </div>

                    {proofs[itemKey] && (
                      <div style={{ marginTop: '14px' }}>
                        <img
                          src={proofs[itemKey]}
                          alt="Proof"
                          style={{
                            width: '100%',
                            borderRadius: '14px',
                            maxHeight: '220px',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}