import { useEffect, useMemo, useRef, useState } from 'react';

export default function FinancialFreedomTracker() {
  const storageKey = 'financial-freedom-tracker';

  const [financialData, setFinancialData] = useState({
    income: '',
  });

  const [expenses, setExpenses] = useState([
    { name: 'Rent', amount: '' },
  ]);

  const [debts, setDebts] = useState([
    { name: 'Credit Card', amount: '' },
  ]);

  const [generatedPlan, setGeneratedPlan] =
    useState(null);

  const [checked, setChecked] = useState({});
  const [proofs, setProofs] = useState({});

  const fileInputRefs = useRef({});

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  useEffect(() => {
    const savedChecked = localStorage.getItem(
      `${storageKey}-checked`
    );

    const savedProofs = localStorage.getItem(
      `${storageKey}-proofs`
    );

    if (savedChecked) {
      setChecked(JSON.parse(savedChecked));
    }

    if (savedProofs) {
      setProofs(JSON.parse(savedProofs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      `${storageKey}-checked`,
      JSON.stringify(checked)
    );
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(
      `${storageKey}-proofs`,
      JSON.stringify(proofs)
    );
  }, [proofs]);

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

  const totalChecklistItems = generatedPlan
    ? generatedPlan.months.flatMap(
        (month) => month.checklist
      ).length
    : 0;

  const completedChecklistItems = Object.values(
    checked
  ).filter(Boolean).length;

  const progress =
    totalChecklistItems > 0
      ? Math.round(
          (completedChecklistItems /
            totalChecklistItems) *
            100
        )
      : 0;

  return (
    <div
      style={{
        padding: '20px',
        background: '#f3f4f6',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* HERO */}

        <div
          style={{
            background: 'white',
            padding: '28px',
            borderRadius: '28px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h1 style={{ margin: 0 }}>
            Financial Freedom Planner
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: '10px',
            }}
          >
            Dynamic debt payoff + wealth-building
            engine.
          </p>

          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <span>Overall Progress</span>
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

        {/* INPUT FORM */}

        <div
          style={{
            background: 'white',
            padding: '28px',
            borderRadius: '28px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2>Build Your Financial Plan</h2>

          {/* INCOME */}

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
                borderRadius: '14px',
                border: '1px solid #ddd',
                marginTop: '8px',
              }}
            />
          </div>

          {/* EXPENSES */}

          <div style={{ marginTop: '28px' }}>
            <h3>Monthly Expenses</h3>

            {expenses.map((expense, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '12px',
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
                    borderRadius: '12px',
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
                    width: '140px',
                    padding: '12px',
                    borderRadius: '12px',
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
                marginTop: '14px',
                background: 'black',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              + Add Expense
            </button>
          </div>

          {/* DEBTS */}

          <div style={{ marginTop: '28px' }}>
            <h3>Debts</h3>

            {debts.map((debt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '12px',
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
                    borderRadius: '12px',
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
                    width: '140px',
                    padding: '12px',
                    borderRadius: '12px',
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
                marginTop: '14px',
                background: 'black',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              + Add Debt
            </button>
          </div>

          {/* GENERATE BUTTON */}

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

              const sortedDebts = [...debts].sort(
                (a, b) => a.amount - b.amount
              );

              let remainingDebt = totalDebt;

              const generateMonthChecklist = (
                monthName,
                debtAllocationPercent,
                savingsPercent
              ) => {
                const checklist = [];

                expenses.forEach((expense) => {
                  checklist.push({
                    title: `Pay ${expense.name}`,
                    amount: expense.amount,
                  });
                });

                const debtBudget = Math.round(
                  freeCash * debtAllocationPercent
                );

                let remainingBudget = debtBudget;

                sortedDebts.forEach((debt) => {
                  if (remainingBudget <= 0) return;

                  const payment = Math.min(
                    debt.amount,
                    remainingBudget
                  );

                  if (payment > 0) {
                    checklist.push({
                      title: `Pay ${debt.name}`,
                      amount: payment,
                    });

                    remainingBudget -= payment;
                    remainingDebt -= payment;
                  }
                });

                const savingsAmount = Math.round(
                  freeCash * savingsPercent
                );

                checklist.push({
                  title:
                    'Transfer Emergency Fund Savings',
                  amount: savingsAmount,
                });

                checklist.push({
                  title: 'Upload payment proofs',
                  amount: 0,
                });

                checklist.push({
                  title: 'Verify balances',
                  amount: 0,
                });

                return {
                  title: monthName,
                  debtPayment:
                    debtBudget - remainingBudget,
                  savings: savingsAmount,
                  remainingDebt:
                    remainingDebt > 0
                      ? remainingDebt
                      : 0,
                  checklist,
                };
              };

              const month1 = generateMonthChecklist(
                'Month 1 — Stabilization',
                0.8,
                0.2
              );

              const month2 = generateMonthChecklist(
                'Month 2 — Aggressive Payoff',
                0.75,
                0.25
              );

              const month3 = generateMonthChecklist(
                'Month 3 — Debt Freedom',
                0.7,
                0.3
              );

              const wealthChecklist = [];

              wealthChecklist.push({
                title: 'Automate savings transfers',
                amount: 0,
              });

              wealthChecklist.push({
                title:
                  'Build emergency fund aggressively',
                amount: Math.round(freeCash * 0.3),
              });

              wealthChecklist.push({
                title: 'Invest monthly',
                amount: Math.round(freeCash * 0.35),
              });

              wealthChecklist.push({
                title: 'Save house deposit',
                amount: Math.round(freeCash * 0.35),
              });

              setGeneratedPlan({
                totalExpenses,
                totalDebt,
                freeCash,

                months: [
                  month1,
                  month2,
                  month3,
                  {
                    title:
                      'Month 4+ — Wealth Building',
                    wealthPhase: true,
                    checklist: wealthChecklist,
                  },
                ],
              });
            }}
            style={{
              width: '100%',
              marginTop: '32px',
              background: 'black',
              color: 'white',
              border: 'none',
              padding: '18px',
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
          <>
            {/* DASHBOARD */}

            <div
              style={{
                background: 'white',
                padding: '28px',
                borderRadius: '28px',
                marginBottom: '20px',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.08)',
              }}
            >
              <h2>Financial Overview</h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  marginTop: '20px',
                }}
              >
                {[
                  {
                    title: 'Income',
                    value:
                      financialData.income,
                    icon: '💰',
                  },
                  {
                    title: 'Expenses',
                    value:
                      generatedPlan.totalExpenses,
                    icon: '📉',
                  },
                  {
                    title: 'Debt',
                    value:
                      generatedPlan.totalDebt,
                    icon: '💳',
                  },
                  {
                    title: 'Free Cash',
                    value:
                      generatedPlan.freeCash,
                    icon: '🚀',
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9fafb',
                      padding: '20px',
                      borderRadius: '18px',
                    }}
                  >
                    <div style={{ fontSize: '28px' }}>
                      {card.icon}
                    </div>

                    <p style={{ color: '#666' }}>
                      {card.title}
                    </p>

                    <h2>
                      {formatCurrency(card.value)}
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC MONTHS */}

            {generatedPlan.months.map(
              (month, monthIndex) => (
                <div
                  key={monthIndex}
                  style={{
                    background: 'white',
                    padding: '28px',
                    borderRadius: '28px',
                    marginBottom: '20px',
                    boxShadow:
                      '0 10px 30px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2>{month.title}</h2>

                  {!month.wealthPhase && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '1fr 1fr',
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
                        <p>Debt Payment</p>

                        <h3>
                          {formatCurrency(
                            month.debtPayment
                          )}
                        </h3>
                      </div>

                      <div
                        style={{
                          background: '#f9fafb',
                          padding: '18px',
                          borderRadius: '16px',
                        }}
                      >
                        <p>Savings</p>

                        <h3>
                          {formatCurrency(
                            month.savings
                          )}
                        </h3>
                      </div>

                      <div
                        style={{
                          background: '#f9fafb',
                          padding: '18px',
                          borderRadius: '16px',
                        }}
                      >
                        <p>Remaining Debt</p>

                        <h3>
                          {formatCurrency(
                            month.remainingDebt
                          )}
                        </h3>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '24px' }}>
                    <h3>Payday Checklist</h3>

                    {month.checklist.map(
                      (task, taskIndex) => {
                        const itemKey = `${month.title}-${taskIndex}`;

                        return (
                          <div
                            key={taskIndex}
                            style={{
                              background:
                                checked[itemKey]
                                  ? '#dcfce7'
                                  : '#f9fafb',
                              padding: '16px',
                              borderRadius:
                                '16px',
                              marginTop: '12px',
                            }}
                          >
                            <label
                              style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems:
                                  'center',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  !!checked[
                                    itemKey
                                  ]
                                }
                                onChange={() =>
                                  toggleItem(
                                    itemKey
                                  )
                                }
                                disabled={
                                  !proofs[
                                    itemKey
                                  ]
                                }
                              />

                              <span
                                style={{
                                  flex: 1,
                                  textDecoration:
                                    checked[
                                      itemKey
                                    ]
                                      ? 'line-through'
                                      : 'none',
                                }}
                              >
                                {task.title}

                                {task.amount >
                                  0 &&
                                  ` — ${formatCurrency(
                                    task.amount
                                  )}`}
                              </span>
                            </label>

                            <div
                              style={{
                                marginTop: '14px',
                              }}
                            >
                              <input
                                ref={(el) =>
                                  (fileInputRefs.current[
                                    itemKey
                                  ] = el)
                                }
                                type="file"
                                accept="image/*"
                                style={{
                                  display:
                                    'none',
                                }}
                                onChange={(e) =>
                                  handleProofUpload(
                                    itemKey,
                                    e.target
                                      .files?.[0]
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
                                  background:
                                    'black',
                                  color: 'white',
                                  padding:
                                    '10px 14px',
                                  borderRadius:
                                    '12px',
                                  cursor:
                                    'pointer',
                                }}
                              >
                                {proofs[itemKey]
                                  ? '✅ Proof Uploaded'
                                  : '📸 Upload Proof'}
                              </button>
                            </div>

                            {proofs[itemKey] && (
                              <img
                                src={
                                  proofs[
                                    itemKey
                                  ]
                                }
                                alt="Proof"
                                style={{
                                  width: '100%',
                                  marginTop:
                                    '14px',
                                  borderRadius:
                                    '16px',
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}