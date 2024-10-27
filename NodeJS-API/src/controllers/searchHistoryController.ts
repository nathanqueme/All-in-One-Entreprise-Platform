//
//  searchHistoryController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'


export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        res.json("get searchHistory");
    } catch (err: any) {
        console.error(`Error while getting searchHistory`, err.message);
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        res.json("create searchHistory");
    } catch (err: any) {
        console.error(`Error while creating searchHistory`, err.message);
        next(err);
    }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        res.json("remove searchHistory");
    } catch (err: any) {
        console.error(`Error while deleting searchHistory`, err.message);
        next(err);
    }
}