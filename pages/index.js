import { useEffect, useRef, useState } from 'react';

export default function FinancialFreedomOS() {
  const STORAGE_KEY = 'financial-freedom-os';

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
     UTILITIES
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

      /* =========================
         MONTHLY EXPENSES
      ========================= */

      cleanExpenses.forEach(
        (expense) => {
          monthTasks.push({
            title: `Pay ${expense.name}`,
            amount: expense.amount,
            type: 'expense',
          });
        }
      );

      /* =========================
         PRIORITIZE DEBTS
      ========================= */

      const prioritizedDebts =
        sortDebtsByStrategy(
          activeDebts,
          debtStrategy
        );

      /* =========================
         MONTHLY DEBT PROCESSING
      ========================= */

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

          /* =========================
             APPLY MONTHLY INTEREST
          ========================= */

          const monthlyInterest =
            (debt.remainingBalance *
              (debt.interestRate /
                100)) /
            12;

          debt.remainingBalance +=
            monthlyInterest;

          /* =========================
             MONTHS LEFT
          ========================= */

          const remainingMonths =
            Math.max(
              1,
              debt.targetMonths -
                currentMonth +
                1
            );

          /* =========================
             REQUIRED PAYMENT
          ========================= */

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

          /* =========================
             DEBT CLEARED
          ========================= */

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

      /* =========================
         SAVINGS ENGINE
      ========================= */

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

      /* =========================
         EMERGENCY FUND STATUS
      ========================= */

      monthTasks.push({
        title: `Emergency Fund Progress (${formatCurrency(
          emergencyFund
        )} / ${formatCurrency(
          emergencyTarget
        )})`,
        amount: 0,
        type: 'info',
      });

      /* =========================
         SMART WARNINGS
      ========================= */

      if (
        totalExpenses /
          monthlyIncome >
        0.65
      ) {
        monthTasks.push({
          title:
            '⚠️ Warning: Expenses exceed 65% of income',
          amount: 0,
          type: 'warning',
        });
      }

      if (
        freeCash <= 0
      ) {
        monthTasks.push({
          title:
            '⚠️ Your expenses exceed your income',
          amount: 0,
          type: 'warning',
        });
      }

      if (
        remainingDebtBudget <= 0 &&
        activeDebts.length > 0
      ) {
        monthTasks.push({
          title:
            '⚠️ Debt payoff timeline may be unrealistic',
          amount: 0,
          type: 'warning',
        });
      }

      /* =========================
         EXECUTION TASKS
      ========================= */

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

      /* =========================
         MONTH SUMMARY
      ========================= */

      const remainingDebt =
        activeDebts.reduce(
          (sum, d) =>
            sum +
            d.remainingBalance,
          0
        );

      months.push({
        title: `Month ${currentMonth} Payday Checklist`,
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
       WEALTH PHASE
    ========================= */

    const wealthTasks = [];

    const emergencyAllocation =
      Math.round(
        freeCash * 0.3
      );

    const investmentAllocation =
      Math.round(
        freeCash * 0.35
      );

    const houseAllocation =
      Math.round(
        freeCash * 0.35
      );

    wealthTasks.push({
      title:
        'Automate savings on payday',
      amount: 0,
      type: 'wealth',
    });

    wealthTasks.push({
      title:
        'Grow emergency fund',
      amount:
        emergencyAllocation,
      type: 'wealth',
    });

    wealthTasks.push({
      title:
        'Invest into TFSA / ETFs',
      amount:
        investmentAllocation,
      type: 'wealth',
    });

    wealthTasks.push({
      title:
        'Save for house deposit',
      amount: houseAllocation,
      type: 'wealth',
    });

    wealthTasks.push({
      title:
        'Review monthly net worth',
      amount: 0,
      type: 'wealth',
    });

    months.push({
      title:
        'Wealth Phase — Financial Freedom',
      wealthPhase: true,
      tasks: wealthTasks,
    });

    setGeneratedPlan({
      monthlyIncome,
      totalExpenses,
      totalDebt,
      freeCash,
      emergencyTarget,
      debtStrategy,
      months,
    });
  };

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
        {/* HERO */}

        <div
          style={{
            background: 'white',
            borderRadius: '28px',
            padding: '28px',
            marginBottom: '20px',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h1
            style={{
              marginTop: 0,
            }}
          >
            Financial Freedom OS
          </h1>

          <p
            style={{
              color: '#666',
            }}
          >
            Financial execution,
            debt elimination,
            savings growth and
            wealth planning.
          </p>

          <div
            style={{
              marginTop: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '8px',
              }}
            >
              <span>
                Execution Progress
              </span>

              <strong>
                {progress}%
              </strong>
            </div>

            <div
              style={{
                height: '14px',
                background:
                  '#e5e7eb',
                borderRadius:
                  '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  background:
                    'black',
                  height: '14px',
                }}
              />
            </div>
          </div>
        </div>

        {/* INPUTS */}

        <div
          style={{
            background: 'white',
            borderRadius: '28px',
            padding: '28px',
            marginBottom: '20px',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2>
            Financial Inputs
          </h2>

          {/* INCOME */}

          <div
            style={{
              marginTop: '20px',
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
                width: '100%',
                marginTop: '8px',
                padding: '14px',
                borderRadius:
                  '14px',
                border:
                  '1px solid #ddd',
              }}
            />
          </div>

          {/* STRATEGY */}

          <div
            style={{
              marginTop: '20px',
            }}
          >
            <label>
              Financial Strategy
            </label>

            <select
              value={strategy}
              onChange={(e) =>
                setStrategy(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '14px',
                borderRadius:
                  '14px',
                border:
                  '1px solid #ddd',
              }}
            >
              <option value="aggressive">
                Aggressive Payoff
              </option>

              <option value="balanced">
                Balanced
              </option>

              <option value="savings-first">
                Savings First
              </option>
            </select>
          </div>

          {/* DEBT STRATEGY */}

          <div
            style={{
              marginTop: '20px',
            }}
          >
            <label>
              Debt Payoff Strategy
            </label>

            <select
              value={debtStrategy}
              onChange={(e) =>
                setDebtStrategy(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '14px',
                borderRadius:
                  '14px',
                border:
                  '1px solid #ddd',
              }}
            >
              <option value="snowball">
                Snowball — Smallest Balance First
              </option>

              <option value="avalanche">
                Avalanche — Highest Interest First
              </option>

              <option value="hybrid">
                Hybrid Strategy
              </option>
            </select>
          </div>

          {/* EXPENSES */}

          <div
            style={{
              marginTop: '30px',
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
                    placeholder="Expense Name"
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
                      borderRadius:
                        '12px',
                      border:
                        '1px solid #ddd',
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
                      borderRadius:
                        '12px',
                      border:
                        '1px solid #ddd',
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
                background:
                  'black',
                color: 'white',
                border: 'none',
                padding:
                  '12px 16px',
                borderRadius:
                  '12px',
              }}
            >
              + Add Expense
            </button>
          </div>

          {/* DEBTS */}

          <div
            style={{
              marginTop: '30px',
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
                      '1fr 1fr 1fr 1fr 1fr',
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

                  <select
                    value={
                      debt.type
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
                      ].type =
                        e.target.value;

                      setDebts(
                        updated
                      );
                    }}
                  >
                    <option value="personal">
                      Personal
                    </option>

                    <option value="credit-card">
                      Credit Card
                    </option>

                    <option value="loan">
                      Loan
                    </option>

                    <option value="store">
                      Store Account
                    </option>
                  </select>

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

                  <input
                    type="number"
                    placeholder="Target Months"
                    value={
                      debt.targetMonths
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
                      ].targetMonths =
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
                    type:
                      'personal',
                    balance:
                      '',
                    interestRate:
                      '',
                    targetMonths:
                      '3',
                    minimumPayment:
                      '',
                  },
                ])
              }
              style={{
                marginTop:
                  '14px',
                background:
                  'black',
                color: 'white',
                border: 'none',
                padding:
                  '12px 16px',
                borderRadius:
                  '12px',
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
              marginTop: '36px',
              background: 'black',
              color: 'white',
              border: 'none',
              padding: '18px',
              borderRadius:
                '16px',
              fontWeight: '700',
              fontSize: '16px',
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
                background:
                  'white',
                borderRadius:
                  '28px',
                padding: '28px',
                marginBottom:
                  '20px',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.08)',
              }}
            >
              <h2>
                Financial Dashboard
              </h2>

              <div
                style={{
                  background:
                    '#f9fafb',
                  padding:
                    '18px',
                  borderRadius:
                    '16px',
                  marginTop:
                    '20px',
                }}
              >
                <h3>
                  Active Debt Strategy
                </h3>

                <p>
                  {debtStrategy ===
                    'snowball' &&
                    'Snowball Strategy: prioritizing smallest balances first for fast wins and momentum.'}

                  {debtStrategy ===
                    'avalanche' &&
                    'Avalanche Strategy: prioritizing highest interest debts first to minimize total interest costs.'}

                  {debtStrategy ===
                    'hybrid' &&
                    'Hybrid Strategy: balancing emotional wins with financial optimization.'}
                </p>
              </div>

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '14px',
                  marginTop:
                    '20px',
                }}
              >
                {[
                  {
                    label:
                      'Income',
                    value:
                      generatedPlan.monthlyIncome,
                    emoji:
                      '💰',
                  },
                  {
                    label:
                      'Expenses',
                    value:
                      generatedPlan.totalExpenses,
                    emoji:
                      '📉',
                  },
                  {
                    label:
                      'Debt',
                    value:
                      generatedPlan.totalDebt,
                    emoji:
                      '💳',
                  },
                  {
                    label:
                      'Free Cash',
                    value:
                      generatedPlan.freeCash,
                    emoji:
                      '🚀',
                  },
                ].map(
                  (
                    card,
                    idx
                  ) => (
                    <div
                      key={idx}
                      style={{
                        background:
                          '#f9fafb',
                        padding:
                          '20px',
                        borderRadius:
                          '18px',
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            '30px',
                        }}
                      >
                        {
                          card.emoji
                        }
                      </div>

                      <p
                        style={{
                          color:
                            '#666',
                        }}
                      >
                        {
                          card.label
                        }
                      </p>

                      <h2>
                        {formatCurrency(
                          card.value
                        )}
                      </h2>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* MONTHS */}

            {generatedPlan.months.map(
              (
                month,
                monthIndex
              ) => (
                <div
                  key={
                    monthIndex
                  }
                  style={{
                    background:
                      'white',
                    borderRadius:
                      '28px',
                    padding:
                      '28px',
                    marginBottom:
                      '20px',
                    boxShadow:
                      '0 10px 30px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2>
                    {
                      month.title
                    }
                  </h2>

                  {!month.wealthPhase && (
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
                      <div
                        style={{
                          background:
                            '#f9fafb',
                          padding:
                            '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>
                          Debt
                          Payments
                        </p>

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
                          padding:
                            '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>
                          Emergency
                          Fund
                        </p>

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
                          padding:
                            '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>
                          Remaining
                          Debt
                        </p>

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
                          padding:
                            '18px',
                          borderRadius:
                            '16px',
                        }}
                      >
                        <p>
                          Savings
                        </p>

                        <h3>
                          {formatCurrency(
                            month.savingsContribution
                          )}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* TASKS */}

                  <div
                    style={{
                      marginTop:
                        '24px',
                    }}
                  >
                    <h3>
                      Execution
                      Checklist
                    </h3>

                    {month.tasks.map(
                      (
                        task,
                        taskIndex
                      ) => {
                        const itemKey = `${month.title}-${taskIndex}`;

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
                                {
                                  task.title
                                }

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
                                ref={(
                                  el
                                ) =>
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
                                onChange={(
                                  e
                                ) =>
                                  handleProofUpload(
                                    itemKey,
                                    e
                                      .target
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
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}