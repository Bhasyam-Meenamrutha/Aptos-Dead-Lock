module srujan_addr::deadlock {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::table;
    // Events/guid removed to avoid friend-only API usage

    struct LockedFunds has key {
        amount: coin::Coin<AptosCoin>
    }

    struct Beneficiary has copy, drop, store {
        addr: address,
        percentage: u8,
    }

    // Removed event-related structs

    // Reverse index of beneficiary -> owners who added them
    struct OwnerEntry has copy, drop, store {
        owner: address,
        percentage: u8,
    }

    struct GlobalIndex has key {
        map: table::Table<address, vector<OwnerEntry>>,
    }

    struct Beneficiaries has key {
        list: vector<Beneficiary>
    }

    #[view]
    public fun get_user_balance(addr: address): u64 {
        coin::balance<AptosCoin>(addr)
    }

    public fun get_user_balance_generic<CoinType>(addr: address): u64 {
        coin::balance<CoinType>(addr)
    }

    public fun get_my_balance(user: &signer): u64 {
        let user_addr = signer::address_of(user);
        coin::balance<AptosCoin>(user_addr)
    }

    public fun has_sufficient_balance(addr: address, required_amount: u64): bool {
        let current_balance = coin::balance<AptosCoin>(addr);
        current_balance >= required_amount
    }

    public fun get_balance_info(addr: address): (u64, bool) {
        let balance = coin::balance<AptosCoin>(addr);
        let has_balance = balance > 0;
        (balance, has_balance)
    }

    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EINVALID_PERCENTAGE: u64 = 2;
    const EOVER_PERCENTAGE: u64 = 3;

public entry fun lock_funds(user: &signer, amount: u64) acquires LockedFunds {
    let addr = signer::address_of(user);

    let current_balance = coin::balance<AptosCoin>(addr);
    if (current_balance < amount) {
        abort EINSUFFICIENT_BALANCE;
    };

    // Withdraw and lock
    let coins = coin::withdraw<AptosCoin>(user, amount);
    if (exists<LockedFunds>(addr)) {
        let locked = borrow_global_mut<LockedFunds>(addr);
        coin::merge(&mut locked.amount, coins);
    } else {
        move_to(user, LockedFunds { amount: coins });
    }
}


    #[view]
    public fun get_locked_funds(addr: address): u64 acquires LockedFunds {
        if (exists<LockedFunds>(addr)) {
            let locked = borrow_global<LockedFunds>(addr);
            coin::value(&locked.amount)
        } else {
            0
        }
    }

    public entry fun add_beneficiary(user: &signer, beneficiary: address, percentage: u8) acquires Beneficiaries, GlobalIndex {
        assert!(percentage > 0 && percentage <= 100, EINVALID_PERCENTAGE);

        let owner = signer::address_of(user);
        if (exists<Beneficiaries>(owner)) {
            let cfg = borrow_global_mut<Beneficiaries>(owner);
            let total: u64 = 0;
            let len = vector::length(&cfg.list);
            let i = 0;
            while (i < len) {
                let b = *vector::borrow(&cfg.list, i);
                total = total + (b.percentage as u64);
                i = i + 1;
            };
            assert!(total + (percentage as u64) <= 100, EOVER_PERCENTAGE);

            vector::push_back(&mut cfg.list, Beneficiary { addr: beneficiary, percentage });
            // Update reverse index if initialized under publisher address
            if (exists<GlobalIndex>(@srujan_addr)) {
                let gi = borrow_global_mut<GlobalIndex>(@srujan_addr);
                if (table::contains<address, vector<OwnerEntry>>(&gi.map, beneficiary)) {
                    let owners_ref = table::borrow_mut<address, vector<OwnerEntry>>(&mut gi.map, beneficiary);
                    vector::push_back(owners_ref, OwnerEntry { owner, percentage });
                } else {
                    let owners_vec = vector::empty<OwnerEntry>();
                    let mut_ref = &mut (owners_vec);
                    vector::push_back(mut_ref, OwnerEntry { owner, percentage });
                    table::add<address, vector<OwnerEntry>>(&mut gi.map, beneficiary, owners_vec);
                };
            }
        } else {
            assert!((percentage as u64) <= 100, EOVER_PERCENTAGE);
            let list = vector::empty<Beneficiary>();
            vector::push_back(&mut list, Beneficiary { addr: beneficiary, percentage });
            move_to(user, Beneficiaries { list });
            // Update reverse index if initialized under publisher address
            if (exists<GlobalIndex>(@srujan_addr)) {
                let gi2 = borrow_global_mut<GlobalIndex>(@srujan_addr);
                if (table::contains<address, vector<OwnerEntry>>(&gi2.map, beneficiary)) {
                    let owners_ref2 = table::borrow_mut<address, vector<OwnerEntry>>(&mut gi2.map, beneficiary);
                    vector::push_back(owners_ref2, OwnerEntry { owner, percentage });
                } else {
                    let owners_vec2 = vector::empty<OwnerEntry>();
                    let mut_ref2 = &mut (owners_vec2);
                    vector::push_back(mut_ref2, OwnerEntry { owner, percentage });
                    table::add<address, vector<OwnerEntry>>(&mut gi2.map, beneficiary, owners_vec2);
                };
            }
        };
    }

    // Removed get_add_beneficiary_event_type (events removed)

    // Initialize reverse index (call once by publisher after publish)
    public entry fun initialize(publisher: &signer) {
        let publisher_addr = signer::address_of(publisher);
        assert!(publisher_addr == @srujan_addr, 100);
        assert!(!exists<GlobalIndex>(@srujan_addr), 101);
        let m = table::new<address, vector<OwnerEntry>>();
        move_to(publisher, GlobalIndex { map: m });
    }

    #[view]
    public fun get_added_as_beneficiary(beneficiary: address): vector<OwnerEntry> acquires GlobalIndex {
        if (exists<GlobalIndex>(@srujan_addr)) {
            let gi = borrow_global<GlobalIndex>(@srujan_addr);
            if (table::contains<address, vector<OwnerEntry>>(&gi.map, beneficiary)) {
                let owners_vec = table::borrow<address, vector<OwnerEntry>>(&gi.map, beneficiary);
                let out = vector::empty<OwnerEntry>();
                let len = vector::length(owners_vec);
                let i = 0;
                while (i < len) {
                    let e = *vector::borrow(owners_vec, i);
                    vector::push_back(&mut out, e);
                    i = i + 1;
                };
                out
            } else {
                vector::empty<OwnerEntry>()
            }
        } else {
            vector::empty<OwnerEntry>()
        }
    }

    #[view]
    public fun get_beneficiaries(owner: address): vector<Beneficiary> acquires Beneficiaries {
        if (exists<Beneficiaries>(owner)) {
            let cfg = borrow_global<Beneficiaries>(owner);
            let out = vector::empty<Beneficiary>();
            let len = vector::length(&cfg.list);
            let i = 0;
            while (i < len) {
                let b = *vector::borrow(&cfg.list, i);
                vector::push_back(&mut out, b);
                i = i + 1;
            };
            out
        } else {
            vector::empty<Beneficiary>()
        }
    }
}
