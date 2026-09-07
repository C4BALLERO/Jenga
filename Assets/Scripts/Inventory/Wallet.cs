using System;
using UnityEngine;

namespace Jenga.Inventory
{
    /// <summary>Dinero del jugador. La UI escucha <see cref="Changed"/>.</summary>
    public class Wallet : MonoBehaviour
    {
        [SerializeField, Min(0)] int money = 100;

        public event Action<int> Changed;

        public int Money => money;

        public void Add(int amount)
        {
            if (amount <= 0) return;
            money += amount;
            Changed?.Invoke(money);
        }

        public bool CanAfford(int amount) => money >= amount;

        public bool Spend(int amount)
        {
            if (amount < 0 || money < amount) return false;
            money -= amount;
            Changed?.Invoke(money);
            return true;
        }

        public void SetMoney(int amount)
        {
            money = Mathf.Max(0, amount);
            Changed?.Invoke(money);
        }
    }
}
