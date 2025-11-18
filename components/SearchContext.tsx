"use client";
import React, {createContext, useContext, useState} from "react";
import { SearchContextType } from "@/types";



const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({children}: {children: React.ReactNode}){
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <SearchContext.Provider value={{searchTerm, setSearchTerm}}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch() {
    const ctx = useContext(SearchContext);

    if(!ctx) throw new Error("useSearch must be used inside SearchProvider");
    return ctx;
}