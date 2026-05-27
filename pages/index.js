import { useEffect, useRef, useState } from 'react';

export default function FinancialFreedomTracker() {
  const storageKey = 'financial-freedom-tracker';

  const [income, setIncome] = useState('');
  const [strategy, setStrategy] =
    useState('aggressive');

  const [expenses, setExpenses] = useState([
    { name: 'Rent', amount: '' },
  ]);

  const [debts, setDebts] = useState([
    {
      name: 'Credit Card',
      amount: '',
      interest: '',
    },
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

  const toggleItem = (key) => {
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

  const generatePlan = () => {
    const monthlyIncome = Number(income);

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    const freeCash =
      monthlyIncome - totalExpenses;

    const emergencyTarget =
      totalExpenses * 3;

    const totalDebt = debts.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );

    let debtPercent = 0.8;
    let savingsPercent = 0.2;

    if (strategy === 'balanced') {
      debtPercent = 0.65;
      savingsPercent = 0.35;
    }

    if (strategy === 'savings') {
      debtPercent = 0.5;
      savingsPercent = 0.5;
    }

    const sortedDebts = [...debts].sort(
      (a, b) => {
        if (
          Number(b.interest || 0) !==
          Number(a.interest || 0)
        ) {
          return (
            Number(b.interest || 0) -
            Number(a.interest || 0)
          );
        }

        return (
          Number(a.amount || 0) -
          Number(b.amount || 0)
        );
      }
    );

    let remainingDebts = sortedDebts.map(
      (d) => ({
        ...d,
        amount: Number(d.amount),
      })
    );

    let emergencyFund = 0;

    let months = [];
    let monthNumber = 1;

    while (
      remainingDebts.some(
        (d) => d.amount > 0
      ) &&
      monthNumber <= 24
    ) {
      const monthChecklist = [];

      expenses.forEach((expense) => {
        monthChecklist.push({
          title: `Pay ${expense.name}`,
          amount: Number(expense.amount),
        });
      });

      const debtBudget = Math.round(
        freeCash * debtPercent
      );

      let remainingBudget = debtBudget;

      remainingDebts.forEach((debt) => {
        if (
          debt.amount <= 0 ||
          remainingBudget <= 0
        )
          return;

        const payment = Math.min(
          debt.amount,
          remainingBudget
        );

        debt.amount -= payment;
        remainingBudget -= payment;

        monthChecklist.push({
          title: `Pay ${debt.name}`,
          amount: payment,
        });
      });

      const savingsAmount = Math.round(
        freeCash * savingsPercent
      );

      emergencyFund += savingsAmount;

      monthChecklist.push({
        title:
          'Transfer Emergency Fund Savings',
        amount: savingsAmount,
      });

      if (
        emergencyFund <
        emergencyTarget
      ) {
        monthChecklist.push({
          title: `Emergency Fund Progress (${formatCurrency(
            emergencyFund
          )} / ${formatCurrency(
            emergencyTarget
          )})`,
          amount: 0,
        });
      }

      if (
        totalExpenses / monthlyIncome >
        0.65
      ) {
        monthChecklist.push({
          title:
            'Warning: Expenses exceed 65% of income',
          amount: 0,
        });
      }

      monthChecklist.push({
        title:
          'Upload all payment proofs',
        amount: 0,
      });

      monthChecklist.push({
        title:
          'Verify bank balances',
        amount: 0,
      });

      monthChecklist.push({
        title:
          'Avoid unnecessary spending',
        amount: 0,
      });

      const remainingDebtTotal =
        remainingDebts.reduce(
          (sum, d) =>
            sum + Number(d.amount || 0),
          0
        );

      months.push({
        title: `Month ${monthNumber} Payday Checklist`,
        debtPayment:
          debtBudget - remainingBudget,
        savings: savingsAmount,
        remainingDebt:
          remainingDebtTotal,
        emergencyFund,
        checklist: monthChecklist,
      });

      monthNumber++;
    }

    const wealthChecklist = [];

    const wealthEmergency = Math.round(
      freeCash * 0.3
    );

    const wealthInvesting = Math.round(
      freeCash * 0.35
    );

    const wealthHouse = Math.round(
      freeCash * 0.35
    );

    wealthChecklist.push({
      title:
        'Automate savings on payday',
      amount: 0,
    });

    wealthChecklist.push({
      title:
        'Grow emergency fund monthly',
      amount: wealthEmergency,
    });

    wealthChecklist.push({
      title:
        'Invest into TFSA / ETFs',
      amount: wealthInvesting,
    });

    wealthChecklist.push({
      title:
        'Save toward house deposit',
      amount: wealthHouse,
    });

    wealthChecklist.push({
      title:
        'Avoid lifestyle inflation',
      amount: 0,
    });

    wealthChecklist.push({
      title:
        'Review financial progress monthly',
      amount: 0,
    });

    months.push({
      title:
        'Wealth Phase — Financial Freedom Mode',
      wealthPhase: true,
      checklist: wealthChecklist,
    });

    setGeneratedPlan({
      totalIncome: monthlyIncome,
      totalExpenses,
      totalDebt,
      freeCash,
      emergencyTarget,
      months,
    });
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* HERO */}

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
          <h1 style={{ margin: 0 }}>
            Financial Freedom OS
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: '10px',
            }}
          >
            Dynamic debt payoff, emergency
            planning, investing, and wealth
            roadmap engine.
          </p>

          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '8px',
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
                  background: 'black',
                  height: '14px',
                }}
              />
            </div>
          </div>
        </div>

        {/* FORM */}

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
          <h2>Financial Inputs</h2>

          {/* INCOME */}

          <div style={{ marginTop: '20px' }}>
            <label>Monthly Income</label>

            <input
              type="number"
              value={income}
              onChange={(e) =>
                setIncome(e.target.value)
              }
              placeholder="19400"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid #ddd',
                marginTop: '8px',
              }}
            />
          </div>

          {/* STRATEGY */}

          <div style={{ marginTop: '24px' }}>
            <label>Payoff Strategy</label>

            <select
              value={strategy}
              onChange={(e) =>
                setStrategy(e.target.value)
              }
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid #ddd',
                marginTop: '8px',
              }}
            >
              <option value="aggressive">
                Aggressive Debt Payoff
              </option>

              <option value="balanced">
                Balanced Strategy
              </option>

              <option value="savings">
                Savings First
              </option>
            </select>
          </div>

          {/* EXPENSES */}

          <div style={{ marginTop: '30px' }}>
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
                    const updated = [
                      ...expenses,
                    ];

                    updated[idx].name =
                      e.target.value;

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
                    const updated = [
                      ...expenses,
                    ];

                    updated[idx].amount =
                      e.target.value;

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
                  {
                    name: '',
                    amount: '',
                  },
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

          <div style={{ marginTop: '30px' }}>
            <h3>Debts</h3>

            {debts.map((debt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 120px 120px',
                  gap: '10px',
                  marginTop: '12px',
                }}
              >
                <input
                  placeholder="Debt Name"
                  value={debt.name}
                  onChange={(e) => {
                    const updated = [
                      ...debts,
                    ];

                    updated[idx].name =
                      e.target.value;

                    setDebts(updated);
                  }}
                  style={{
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
                    const updated = [
                      ...debts,
                    ];

                    updated[idx].amount =
                      e.target.value;

                    setDebts(updated);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                  }}
                />

                <input
                  type="number"
                  placeholder="% Interest"
                  value={debt.interest}
                  onChange={(e) => {
                    const updated = [
                      ...debts,
                    ];

                    updated[idx].interest =
                      e.target.value;

                    setDebts(updated);
                  }}
                  style={{
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
                  {
                    name: '',
                    amount: '',
                    interest: '',
                  },
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

          {/* BUTTON */}

          <button
            onClick={generatePlan}
            style={{
              width: '100%',
              marginTop: '36px',
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
            Generate Financial Roadmap
          </button>
        </div>

        {/* DASHBOARD */}

        {generatedPlan && (
          <>
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
              <h2>Financial Dashboard</h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '14px',
                  marginTop: '20px',
                }}
              >
                {[
                  {
                    title: 'Monthly Income',
                    value:
                      generatedPlan.totalIncome,
                    icon: '💰',
                  },
                  {
                    title:
                      'Monthly Expenses',
                    value:
                      generatedPlan.totalExpenses,
                    icon: '📉',
                  },
                  {
                    title: 'Total Debt',
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
                    <div style={{ fontSize: '30px' }}>
                      {card.icon}
                    </div>

                    <p style={{ color: '#666' }}>
                      {card.title}
                    </p>

                    <h2>
                      {formatCurrency(
                        card.value
                      )}
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            {/* MONTHS */}

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
                          background:
                            '#f9fafb',
                          padding: '18px',
                          borderRadius:
                            '16px',
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
                          background:
                            '#f9fafb',
                          padding: '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>Emergency Fund</p>

                        <h3>
                          {formatCurrency(
                            month.emergencyFund
                          )}
                        </h3>
                      </div>

                      <div
                        style={{
                          background:
                            '#f9fafb',
                          padding: '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>Remaining Debt</p>

                        <h3>
                          {formatCurrency(
                            month.remainingDebt
                          )}
                        </h3>
                      </div>

                      <div
                        style={{
                          background:
                            '#f9fafb',
                          padding: '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>Savings</p>

                        <h3>
                          {formatCurrency(
                            month.savings
                          )}
                        </h3>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '24px' }}>
                    <h3>Checklist</h3>

                    {month.checklist.map(
                      (task, taskIndex) => {
                        const itemKey = `${month.title}-${taskIndex}`;

                        return (
                          <div
                            key={taskIndex}
                            style={{
                              background:
                                checked[
                                  itemKey
                                ]
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
                                disabled={
                                  !proofs[
                                    itemKey
                                  ]
                                }
                                onChange={() =>
                                  toggleItem(
                                    itemKey
                                  )
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
                                marginTop:
                                  '12px',
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
                                  background:
                                    'black',
                                  color: 'white',
                                  border: 'none',
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
                                    '12px',
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