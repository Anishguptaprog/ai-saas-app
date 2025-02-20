export interface Plan {
    name:string;
    amount:number;
    currency:string;
    interval:string;
    isPopular?:boolean;
    description:string;
    features:string[];
}

export const availablePlans: Plan[] = [
    {
        name:"Weekly Plan",
        amount:9.99,
        currency:"USD",
        interval:"week",
        description:"Get a new meal plan every week",
        features:[
            "Unlimited AI meal plans",
            "AI nutrition insights",
            "Cancel anytime"
        ],
    },
    {
        name:"Monthly Plan",
        amount:29.99,
        currency:"USD",
        interval:"month",
        description:"Get a new meal plan every month",
        features:[
            "Unlimited AI meal plans",
            "Priority AI support",
            "Cancel anytime"
        ],
    },
    {
        name:"Yearly Plan",
        amount:99.99,
        currency:"USD",
        interval:"year",
        description:"Get a new meal plan every year",
        features:[
            "Unlimited AI meal plans",
            "All premimum features",
            "Cancel anytime"
        ],
        isPopular:true,
    },
]