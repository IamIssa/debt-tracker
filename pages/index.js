import { useEffect, useRef, useState } from 'react';

export default function FinancialFreedomOS() {
  const STORAGE_KEY = 'financial-freedom-os';

  /* =========================
     NAVIGATION
  ========================= */

  const [currentScreen, setCurrentScreen] =
    useState('setup');

  const [selectedMonth, setSelectedMonth] =
    useState(null);

  /* =========================
     USER INPUTS
  ========================= */

  const [income, setIncome] = useState('');

  const [strategy, setStrategy] =
    useState('aggressive');

  const [debtStrategy, setDebtStrategy] =
    useState('avalanche');

  const [expenses, setExpenses] = useState([
    {
      name: 'Rent',
      amount: '',
    },
  ]);

  const [debts, setDebts] = useState([
    {
      id: Date.now(),
      name: 'Credit Card',
      type: 'credit-card',
      balance: '',
      interestRate: '',
      targetMonths: '3',
      minimumPayment: '',
    },
  ]);

  /* =========================
     GENERATED PLAN
  ========================= */

  const [generatedPlan, setGeneratedPlan] =
    useState(null);

  /* =========================
     EXECUTION STATE
  ========================= */

  const [checked, setChecked] = useState({});
  const [proofs, setProofs] = useState({});

  const fileInputRefs = useRef({});

  /* =========================
     FORMATTERS
  ========================= */

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  /* =========================
     LOCAL STORAGE
  ========================= */

  useEffect(() => {
    const savedChecked = localStorage.getItem(
      `${STORAGE_KEY}-checked`
    );

    const savedProofs = localStorage.getItem(
      `${STORAGE_KEY}-proofs`
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
      `${STORAGE_KEY}-checked`,
      JSON.stringify(checked)
    );
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}-proofs`,
      JSON.stringify(proofs)
    );
  }, [proofs]);

  /* =========================
     CHECKLIST LOGIC
  ========================= */

  const toggleItem = (key) => {
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProofUpload = (
    key,
    file
  ) => {
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

  /* =========================
     PROGRESS
  ========================= */

  const totalChecklistItems = generatedPlan
    ? generatedPlan.months.flatMap(
        (m) => m.tasks
      ).length
    : 0;

  const completedChecklistItems =
    Object.values(checked).filter(
      Boolean
    ).length;

  const progress =
    totalChecklistItems > 0
      ? Math.round(
          (completedChecklistItems /
            totalChecklistItems) *
            100
        )
      : 0;

  /* =========================
     DEBT STRATEGY ENGINE
  ========================= */

  const sortDebtsByStrategy = (
    debts,
    strategy
  ) => {
    const sorted = [...debts];

    if (strategy === 'snowball') {
      return sorted.sort(
        (a, b) =>
          a.remainingBalance -
          b.remainingBalance
      );
    }

    if (strategy === 'avalanche') {
      return sorted.sort(
        (a, b) =>
          b.interestRate -
          a.interestRate
      );
    }

    if (strategy === 'hybrid') {
      return sorted.sort((a, b) => {
        const aScore =
          a.interestRate * 0.7 -
          a.remainingBalance * 0.3;

        const bScore =
          b.interestRate * 0.7 -
          b.remainingBalance * 0.3;

        return bScore - aScore;
      });
    }

    return sorted;
  };

  /* =========================
     FINANCIAL ENGINE
  ========================= */

  const generateFinancialRoadmap = () => {
    const monthlyIncome = Number(income);

    const cleanExpenses = expenses.map(
      (e) => ({
        ...e,
        amount: Number(e.amount || 0),
      })
    );

    const cleanDebts = debts.map((d) => ({
      ...d,
      balance: Number(d.balance || 0),
      remainingBalance: Number(
        d.balance || 0
      ),
      interestRate: Number(
        d.interestRate || 0
      ),
      targetMonths: Number(
        d.targetMonths || 1
      ),
      minimumPayment: Number(
        d.minimumPayment || 0
      ),
      status: 'active',
    }));

    const totalExpenses =
      cleanExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
      );

    const freeCash =
      monthlyIncome - totalExpenses;

    const totalDebt =
      cleanDebts.reduce(
        (sum, d) => sum + d.balance,
        0
      );

    const emergencyTarget =
      totalExpenses * 3;

    let emergencyFund = 0;

    let debtAllocation = 0.8;
    let savingsAllocation = 0.2;

    if (strategy === 'balanced') {
      debtAllocation = 0.65;
      savingsAllocation = 0.35;
    }

    if (strategy === 'savings-first') {
      debtAllocation = 0.5;
      savingsAllocation = 0.5;
    }

    let months = [];

    let currentMonth = 1;

    let activeDebts = [...cleanDebts];

    while (
      activeDebts.some(
        (d) =>
          d.remainingBalance > 0
      ) &&
      currentMonth <= 36
    ) {
      let monthTasks = [];

      cleanExpenses.forEach(
        (expense) => {
          monthTasks.push({
            title: `Pay ${expense.name}`,
            amount: expense.amount,
            type: 'expense',
          });
        }
      );

      const prioritizedDebts =
        sortDebtsByStrategy(
          activeDebts,
          debtStrategy
        );

      const availableDebtBudget =
        Math.round(
          freeCash * debtAllocation
        );

      let remainingDebtBudget =
        availableDebtBudget;

      activeDebts = prioritizedDebts
        .map((debt) => {
          if (
            debt.remainingBalance <= 0
          )
            return debt;

          const monthlyInterest =
            (debt.remainingBalance *
              (debt.interestRate /
                100)) /
            12;

          debt.remainingBalance +=
            monthlyInterest;

          const remainingMonths =
            Math.max(
              1,
              debt.targetMonths -
                currentMonth +
                1
            );

          const requiredPayment =
            Math.max(
              debt.minimumPayment,
              debt.remainingBalance /
                remainingMonths
            );

          const actualPayment =
            Math.min(
              requiredPayment,
              remainingDebtBudget,
              debt.remainingBalance
            );

          debt.remainingBalance -=
            actualPayment;

          remainingDebtBudget -=
            actualPayment;

          if (actualPayment > 0) {
            monthTasks.push({
              title: `Pay ${debt.name}`,
              amount:
                Math.round(
                  actualPayment
                ),
              type: 'debt',
            });
          }

          if (
            debt.remainingBalance <= 1
          ) {
            debt.remainingBalance = 0;

            debt.status = 'paid';

            monthTasks.push({
              title: `${debt.name} cleared 🎉`,
              amount: 0,
              type: 'milestone',
            });
          }

          return debt;
        })
        .filter(
          (d) =>
            d.remainingBalance > 0
        );

      const savingsContribution =
        Math.round(
          freeCash *
            savingsAllocation
        );

      emergencyFund +=
        savingsContribution;

      monthTasks.push({
        title:
          'Transfer to Emergency Fund',
        amount: savingsContribution,
        type: 'savings',
      });

      monthTasks.push({
        title: `Emergency Fund Progress (${formatCurrency(
          emergencyFund
        )} / ${formatCurrency(
          emergencyTarget
        )})`,
        amount: 0,
        type: 'info',
      });

      monthTasks.push({
        title:
          'Upload payment screenshots',
        amount: 0,
        type: 'execution',
      });

      monthTasks.push({
        title:
          'Verify account balances',
        amount: 0,
        type: 'execution',
      });

      monthTasks.push({
        title:
          'Avoid unnecessary spending',
        amount: 0,
        type: 'execution',
      });

      const remainingDebt =
        activeDebts.reduce(
          (sum, d) =>
            sum +
            d.remainingBalance,
          0
        );

      months.push({
        title: `Month ${currentMonth}`,
        monthNumber:
          currentMonth,
        debtPayment:
          availableDebtBudget -
          remainingDebtBudget,
        savingsContribution,
        remainingDebt,
        emergencyFund,
        tasks: monthTasks,
      });

      currentMonth++;
    }

    /* =========================
       WEALTH PHASE ENGINE
    ========================= */

    const wealthMonths =
      24;

    const emergencyMonthly =
      Math.round(
        freeCash * 0.3
      );

    const investmentMonthly =
      Math.round(
        freeCash * 0.35
      );

    const houseMonthly =
      Math.round(
        freeCash * 0.35
      );

    const projectedEmergency =
      emergencyFund +
      emergencyMonthly *
        wealthMonths;

    const projectedInvestments =
      investmentMonthly *
      wealthMonths;

    const projectedHouseDeposit =
      houseMonthly *
      wealthMonths;

    const projectedNetWorth =
      projectedEmergency +
      projectedInvestments +
      projectedHouseDeposit;

    const savingsRate =
      Math.round(
        (freeCash /
          monthlyIncome) *
          100
      );

    const wealthScore =
      Math.min(
        100,
        savingsRate + 25
      );

    setGeneratedPlan({
      monthlyIncome,
      totalExpenses,
      totalDebt,
      freeCash,
      emergencyTarget,
      projectedEmergency,
      projectedInvestments,
      projectedHouseDeposit,
      projectedNetWorth,
      wealthScore,
      savingsRate,
      debtStrategy,
      months,
    });

    setCurrentScreen(
      'dashboard'
    );
  };

  /* =========================
     MONTH SCREEN
  ========================= */

  const renderMonthScreen = () => {
    if (!selectedMonth)
      return null;

    return (
      <div
        style={{
          background: 'white',
          borderRadius: '28px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() =>
            setCurrentScreen(
              'dashboard'
            )
          }
          style={{
            marginBottom: '20px',
            padding: '12px 18px',
            borderRadius: '12px',
            border: 'none',
            background: 'black',
            color: 'white',
          }}
        >
          ← Back
        </button>

        <h1>
          {selectedMonth.title}
        </h1>

        {!selectedMonth.wealthPhase && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <DashboardCard
              label="Debt Payments"
              value={formatCurrency(
                selectedMonth.debtPayment
              )}
            />

            <DashboardCard
              label="Emergency Fund"
              value={formatCurrency(
                selectedMonth.emergencyFund
              )}
            />

            <DashboardCard
              label="Remaining Debt"
              value={formatCurrency(
                selectedMonth.remainingDebt
              )}
            />

            <DashboardCard
              label="Savings"
              value={formatCurrency(
                selectedMonth.savingsContribution
              )}
            />
          </div>
        )}

        <div
          style={{
            marginTop: '24px',
          }}
        >
          {selectedMonth.tasks.map(
            (
              task,
              taskIndex
            ) => {
              const itemKey = `${selectedMonth.title}-${taskIndex}`;

              return (
                <div
                  key={
                    taskIndex
                  }
                  style={{
                    background:
                      checked[
                        itemKey
                      ]
                        ? '#dcfce7'
                        : '#f9fafb',
                    padding:
                      '16px',
                    borderRadius:
                      '16px',
                    marginTop:
                      '12px',
                  }}
                >
                  <label
                    style={{
                      display:
                        'flex',
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
                        color:
                          'white',
                        border:
                          'none',
                        padding:
                          '10px 14px',
                        borderRadius:
                          '12px',
                      }}
                    >
                      {proofs[
                        itemKey
                      ]
                        ? '✅ Proof Uploaded'
                        : '📸 Upload Proof'}
                    </button>
                  </div>

                  {proofs[
                    itemKey
                  ] && (
                    <img
                      src={
                        proofs[
                          itemKey
                        ]
                      }
                      alt="Proof"
                      style={{
                        width:
                          '100%',
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
    );
  };

  /* =========================
     COMPONENTS
  ========================= */

  const DashboardCard = ({
    label,
    value,
  }) => (
    <div
      style={{
        background: '#f9fafb',
        padding: '18px',
        borderRadius: '16px',
      }}
    >
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div
      style={{
        background: '#f3f4f6',
        minHeight: '100vh',
        padding: '20px',
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
        }}
      >
        {/* SETUP SCREEN */}

        {currentScreen ===
          'setup' && (
          <div
            style={{
              background:
                'white',
              borderRadius:
                '28px',
              padding: '28px',
            }}
          >
            <h1>
              Financial Freedom OS
            </h1>

            <p>
              Build your
              intelligent
              financial roadmap
            </p>

            {/* INCOME */}

            <div
              style={{
                marginTop:
                  '20px',
              }}
            >
              <label>
                Monthly Income
              </label>

              <input
                type="number"
                value={income}
                onChange={(e) =>
                  setIncome(
                    e.target.value
                  )
                }
                style={{
                  width:
                    '100%',
                  marginTop:
                    '8px',
                  padding:
                    '14px',
                  borderRadius:
                    '14px',
                  border:
                    '1px solid #ddd',
                }}
              />
            </div>

            {/* STRATEGIES */}

            <div
              style={{
                marginTop:
                  '20px',
              }}
            >
              <label>
                Financial
                Strategy
              </label>

              <select
                value={strategy}
                onChange={(e) =>
                  setStrategy(
                    e.target.value
                  )
                }
                style={{
                  width:
                    '100%',
                  marginTop:
                    '8px',
                  padding:
                    '14px',
                  borderRadius:
                    '14px',
                  border:
                    '1px solid #ddd',
                }}
              >
                <option value="aggressive">
                  Aggressive
                </option>

                <option value="balanced">
                  Balanced
                </option>

                <option value="savings-first">
                  Savings First
                </option>
              </select>
            </div>

            <div
              style={{
                marginTop:
                  '20px',
              }}
            >
              <label>
                Debt Strategy
              </label>

              <select
                value={
                  debtStrategy
                }
                onChange={(e) =>
                  setDebtStrategy(
                    e.target.value
                  )
                }
                style={{
                  width:
                    '100%',
                  marginTop:
                    '8px',
                  padding:
                    '14px',
                  borderRadius:
                    '14px',
                  border:
                    '1px solid #ddd',
                }}
              >
                <option value="snowball">
                  Snowball
                </option>

                <option value="avalanche">
                  Avalanche
                </option>

                <option value="hybrid">
                  Hybrid
                </option>
              </select>
            </div>

            {/* EXPENSES */}

            <div
              style={{
                marginTop:
                  '30px',
              }}
            >
              <h3>
                Monthly Expenses
              </h3>

              {expenses.map(
                (
                  expense,
                  idx
                ) => (
                  <div
                    key={idx}
                    style={{
                      display:
                        'flex',
                      gap: '10px',
                      marginTop:
                        '12px',
                    }}
                  >
                    <input
                      placeholder="Expense"
                      value={
                        expense.name
                      }
                      onChange={(
                        e
                      ) => {
                        const updated =
                          [
                            ...expenses,
                          ];

                        updated[
                          idx
                        ].name =
                          e.target.value;

                        setExpenses(
                          updated
                        );
                      }}
                      style={{
                        flex: 1,
                        padding:
                          '12px',
                      }}
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      value={
                        expense.amount
                      }
                      onChange={(
                        e
                      ) => {
                        const updated =
                          [
                            ...expenses,
                          ];

                        updated[
                          idx
                        ].amount =
                          e.target.value;

                        setExpenses(
                          updated
                        );
                      }}
                      style={{
                        width:
                          '140px',
                        padding:
                          '12px',
                      }}
                    />
                  </div>
                )
              )}

              <button
                onClick={() =>
                  setExpenses([
                    ...expenses,
                    {
                      name: '',
                      amount:
                        '',
                    },
                  ])
                }
                style={{
                  marginTop:
                    '14px',
                }}
              >
                + Add Expense
              </button>
            </div>

            {/* DEBTS */}

            <div
              style={{
                marginTop:
                  '30px',
              }}
            >
              <h3>Debts</h3>

              {debts.map(
                (
                  debt,
                  idx
                ) => (
                  <div
                    key={
                      debt.id
                    }
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '1fr 1fr 1fr',
                      gap: '10px',
                      marginTop:
                        '12px',
                    }}
                  >
                    <input
                      placeholder="Debt Name"
                      value={
                        debt.name
                      }
                      onChange={(
                        e
                      ) => {
                        const updated =
                          [
                            ...debts,
                          ];

                        updated[
                          idx
                        ].name =
                          e.target.value;

                        setDebts(
                          updated
                        );
                      }}
                    />

                    <input
                      type="number"
                      placeholder="Balance"
                      value={
                        debt.balance
                      }
                      onChange={(
                        e
                      ) => {
                        const updated =
                          [
                            ...debts,
                          ];

                        updated[
                          idx
                        ].balance =
                          e.target.value;

                        setDebts(
                          updated
                        );
                      }}
                    />

                    <input
                      type="number"
                      placeholder="Interest %"
                      value={
                        debt.interestRate
                      }
                      onChange={(
                        e
                      ) => {
                        const updated =
                          [
                            ...debts,
                          ];

                        updated[
                          idx
                        ].interestRate =
                          e.target.value;

                        setDebts(
                          updated
                        );
                      }}
                    />
                  </div>
                )
              )}

              <button
                onClick={() =>
                  setDebts([
                    ...debts,
                    {
                      id: Date.now(),
                      name: '',
                      balance:
                        '',
                      interestRate:
                        '',
                    },
                  ])
                }
                style={{
                  marginTop:
                    '14px',
                }}
              >
                + Add Debt
              </button>
            </div>

            {/* GENERATE */}

            <button
              onClick={
                generateFinancialRoadmap
              }
              style={{
                width: '100%',
                marginTop:
                  '36px',
                background:
                  'black',
                color: 'white',
                border: 'none',
                padding:
                  '18px',
                borderRadius:
                  '16px',
                fontWeight:
                  '700',
                fontSize:
                  '16px',
              }}
            >
              Generate Plan
            </button>
          </div>
        )}

        {/* DASHBOARD SCREEN */}

        {currentScreen ===
          'dashboard' &&
          generatedPlan && (
            <>
              <div
                style={{
                  background:
                    'white',
                  borderRadius:
                    '28px',
                  padding:
                    '28px',
                  marginBottom:
                    '20px',
                }}
              >
                <h1>
                  Master Dashboard
                </h1>

                <p>
                  Execution
                  Progress:{' '}
                  {progress}%
                </p>

                <div
                  style={{
                    height:
                      '14px',
                    background:
                      '#e5e7eb',
                    borderRadius:
                      '999px',
                    overflow:
                      'hidden',
                    marginTop:
                      '10px',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      background:
                        'black',
                      height:
                        '14px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '12px',
                    marginTop:
                      '24px',
                  }}
                >
                  <DashboardCard
                    label="Income"
                    value={formatCurrency(
                      generatedPlan.monthlyIncome
                    )}
                  />

                  <DashboardCard
                    label="Expenses"
                    value={formatCurrency(
                      generatedPlan.totalExpenses
                    )}
                  />

                  <DashboardCard
                    label="Debt"
                    value={formatCurrency(
                      generatedPlan.totalDebt
                    )}
                  />

                  <DashboardCard
                    label="Free Cash"
                    value={formatCurrency(
                      generatedPlan.freeCash
                    )}
                  />
                </div>
              </div>

              {/* MONTH NAVIGATION */}

              <div
                style={{
                  background:
                    'white',
                  borderRadius:
                    '28px',
                  padding:
                    '28px',
                  marginBottom:
                    '20px',
                }}
              >
                <h2>
                  Monthly
                  Execution Plan
                </h2>

                {generatedPlan.months.map(
                  (
                    month,
                    idx
                  ) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMonth(
                          month
                        );

                        setCurrentScreen(
                          'month'
                        );
                      }}
                      style={{
                        width:
                          '100%',
                        marginTop:
                          '14px',
                        padding:
                          '18px',
                        borderRadius:
                          '18px',
                        border:
                          'none',
                        background:
                          '#f9fafb',
                        textAlign:
                          'left',
                      }}
                    >
                      <strong>
                        {
                          month.title
                        }
                      </strong>

                      {!month
                        .wealthPhase && (
                        <p>
                          Remaining
                          Debt:{' '}
                          {formatCurrency(
                            month.remainingDebt
                          )}
                        </p>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* WEALTH PHASE */}

              <div
                style={{
                  background:
                    'white',
                  borderRadius:
                    '28px',
                  padding:
                    '28px',
                }}
              >
                <h2>
                  Wealth Phase
                  Forecast
                </h2>

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '12px',
                    marginTop:
                      '20px',
                  }}
                >
                  <DashboardCard
                    label="Projected Emergency Fund"
                    value={formatCurrency(
                      generatedPlan.projectedEmergency
                    )}
                  />

                  <DashboardCard
                    label="Projected Investments"
                    value={formatCurrency(
                      generatedPlan.projectedInvestments
                    )}
                  />

                  <DashboardCard
                    label="Projected House Deposit"
                    value={formatCurrency(
                      generatedPlan.projectedHouseDeposit
                    )}
                  />

                  <DashboardCard
                    label="Projected Net Worth"
                    value={formatCurrency(
                      generatedPlan.projectedNetWorth
                    )}
                  />

                  <DashboardCard
                    label="Savings Rate"
                    value={`${generatedPlan.savingsRate}%`}
                  />

                  <DashboardCard
                    label="Wealth Score"
                    value={`${generatedPlan.wealthScore}/100`}
                  />
                </div>
              </div>
            </>
          )}

        {/* MONTH SCREEN */}

        {currentScreen ===
          'month' &&
          renderMonthScreen()}
      </div>
    </div>
  );
}