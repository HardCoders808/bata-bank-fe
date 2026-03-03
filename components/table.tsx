"use client";

import React, { useState, useMemo, useCallback, createContext, useContext } from "react";
import {
    Box,
    Table,
    Input,
    InputGroup,
    Skeleton,
    Flex,
    Text,
    ButtonGroup,
    Button,
    HStack,
    NativeSelect,
    IconButton,
} from "@chakra-ui/react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
    key: string | null;
    direction: SortDirection;
}

interface SeznamContextValue {
    data: Record<string, unknown>[];
    sortState: SortState;
    onSort: (key: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SeznamContext = createContext<SeznamContextValue | null>(null);

// ─── SeznamColumn ─────────────────────────────────────────────────────────────

export interface SeznamColumnProps<T = Record<string, unknown>> {
    /** Klíč v datovém objektu */
    dataKey: keyof T & string;
    /** Nadpis sloupce */
    label: string;
    /** Vlastní renderer buňky */
    render?: (value: T[keyof T], row: T) => React.ReactNode;
    /** Povolit řazení */
    sortable?: boolean;
    /** Šířka sloupce (CSS hodnota) */
    width?: string;
    /** Zarovnání obsahu buňky */
    align?: "left" | "center" | "right";
}

export function SeznamColumn<T = Record<string, unknown>>(_props: SeznamColumnProps<T>) {
    return null;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <Table.Row key={i}>
                    {Array.from({ length: columns }).map((_, j) => (
                        <Table.Cell key={j}>
                            <Skeleton height="16px" borderRadius="md" />
                        </Table.Cell>
                    ))}
                </Table.Row>
            ))}
        </>
    );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
    if (direction === "asc") return <ChevronUp size={14} />;
    if (direction === "desc") return <ChevronDown size={14} />;
    return (
        <Box as="span" opacity={0.3} fontSize="10px" lineHeight={1}>
            ↕
        </Box>
    );
}

// ─── Main Seznam component ────────────────────────────────────────────────────

export interface SeznamProps<T extends Record<string, unknown> = Record<string, unknown>> {
    /** Pole datových objektů */
    data: T[];
    /** Načítání dat */
    isLoading?: boolean;
    /** Počet skeleton řádků při načítání */
    skeletonRows?: number;
    /** Zobrazit vyhledávací pole */
    searchable?: boolean;
    /** Placeholder pro vyhledávání */
    searchPlaceholder?: string;
    /** Klíče, podle kterých se vyhledává (výchozí: všechny hodnoty) */
    searchKeys?: (keyof T & string)[];
    /** Povolit stránkování */
    paginated?: boolean;
    /** Výchozí počet řádků na stránku */
    defaultPageSize?: number;
    /** Možnosti počtu řádků na stránku */
    pageSizeOptions?: number[];
    /** Výchozí řazení */
    defaultSort?: SortState;
    /** Prázdný stav — vlastní text nebo element */
    emptyState?: React.ReactNode;
    /** Barva pozadí celé tabulky — použij CSS proměnnou Chakry nebo hex, např. "var(--chakra-colors-blue-50)" nebo "#f0f4ff" */
    tableBg?: string;
    /** Barva pozadí hlavičky — použij CSS proměnnou nebo hex (výchozí: var(--chakra-colors-gray-50)) */
    headerBg?: string;
    /** Barva hover efektu řádku — použij CSS proměnnou nebo hex (výchozí: var(--chakra-colors-gray-50)) */
    rowHoverBg?: string;
    /** Callback při kliknutí na řádek (pro detail modal apod.) */
    onRowClick?: (row: T) => void;
    /** Sloupce jako children (<SeznamColumn />) */
    children: React.ReactNode;
}

export function Seznam<T extends Record<string, unknown> = Record<string, unknown>>({
                                                                                        data,
                                                                                        isLoading = false,
                                                                                        skeletonRows = 5,
                                                                                        searchable = false,
                                                                                        searchPlaceholder = "Vyhledat…",
                                                                                        searchKeys,
                                                                                        paginated = false,
                                                                                        defaultPageSize = 10,
                                                                                        pageSizeOptions = [5, 10, 25, 50],
                                                                                        defaultSort = { key: null, direction: null },
                                                                                        emptyState,
                                                                                        tableBg,
                                                                                        headerBg = "var(--chakra-colors-gray-50)",
                                                                                        rowHoverBg = "var(--chakra-colors-gray-50)",
                                                                                        onRowClick,
                                                                                        children,
                                                                                    }: SeznamProps<T>) {
    const [search, setSearch] = useState("");
    const [sortState, setSortState] = useState<SortState>(defaultSort);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // ── Collect column definitions from children ──
    const columns = useMemo(() => {
        const cols: SeznamColumnProps[] = [];
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.type === SeznamColumn) {
                cols.push(child.props as SeznamColumnProps);
            }
        });
        return cols;
    }, [children]);

    // ── Sort handler ──
    const handleSort = useCallback((key: string) => {
        setSortState((prev) => {
            if (prev.key !== key) return { key, direction: "asc" };
            if (prev.direction === "asc") return { key, direction: "desc" };
            return { key: null, direction: null };
        });
        setPage(1);
    }, []);

    // ── Filter ──
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter((row) => {
            const keys = searchKeys ?? (Object.keys(row) as (keyof T & string)[]);
            return keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
        });
    }, [data, search, searchKeys]);

    // ── Sort ──
    const sorted = useMemo(() => {
        if (!sortState.key || !sortState.direction) return filtered;
        const key = sortState.key;
        const dir = sortState.direction === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const av = a[key] ?? "";
            const bv = b[key] ?? "";
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
    }, [filtered, sortState]);

    // ── Paginate ──
    const totalPages = paginated ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
    const visibleData = paginated ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const contextValue: SeznamContextValue = {
        data: visibleData as Record<string, unknown>[],
        sortState,
        onSort: handleSort,
    };

    return (
        <SeznamContext.Provider value={contextValue}>
            <Box>
                {/* Search bar */}
                {searchable && (
                    <Box mb={4}>
                        <InputGroup
                            maxW="320px"
                            startElement={<Search size={16} color="var(--chakra-colors-gray-400)" />}
                        >
                            <Input
                                value={search}
                                onChange={handleSearch}
                                placeholder={searchPlaceholder}
                            />
                        </InputGroup>
                    </Box>
                )}

                {/* Table */}
                <Box
                    overflowX="auto"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    _dark={{ borderColor: "#1a3a50" }}
                    style={{ backgroundColor: "#0d1f30" }}
                >
                    <Table.Root variant="line" size="md">
                        <Table.Header style={{ backgroundColor: "#0a1929" }}>
                            <Table.Row>
                                {columns.map((col) => (
                                    <Table.ColumnHeader
                                        key={col.dataKey}
                                        width={col.width}
                                        textAlign={col.align ?? "left"}
                                        cursor={col.sortable ? "pointer" : "default"}
                                        userSelect="none"
                                        _hover={
                                            col.sortable
                                                ? { bg: "none" }
                                                : {}
                                        }
                                        onClick={col.sortable ? () => handleSort(col.dataKey) : undefined}
                                        whiteSpace="nowrap"
                                    >
                                        <HStack
                                            gap={1}
                                            justify={
                                                col.align === "right"
                                                    ? "flex-end"
                                                    : col.align === "center"
                                                        ? "center"
                                                        : "flex-start"
                                            }
                                        >
                                            <span>{col.label}</span>
                                            {col.sortable && (
                                                <SortIcon
                                                    direction={
                                                        sortState.key === col.dataKey
                                                            ? sortState.direction
                                                            : null
                                                    }
                                                />
                                            )}
                                        </HStack>
                                    </Table.ColumnHeader>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {isLoading ? (
                                <SkeletonRows columns={columns.length} rows={skeletonRows} />
                            ) : visibleData.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell
                                        colSpan={columns.length}
                                        textAlign="center"
                                        py={10}
                                        color="gray.400"
                                    >
                                        {emptyState ?? "Žádné záznamy nenalezeny."}
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                visibleData.map((row, rowIdx) => (
                                    <Table.Row
                                        key={rowIdx}
                                        bg="#0d1f30"
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#112840"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                                        transition="background 0.15s"
                                        onClick={() => onRowClick?.(row as unknown as T)}
                                        cursor={onRowClick ? "pointer" : "default"}
                                    >
                                        {columns.map((col) => (
                                            <Table.Cell key={col.dataKey} textAlign={col.align ?? "left"} color="white">
                                                {col.render
                                                    ? col.render(
                                                        row[col.dataKey] as T[keyof T],
                                                        row as unknown as T
                                                    )
                                                    : String(row[col.dataKey] ?? "")}
                                            </Table.Cell>
                                        ))}
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>

                {/* Pagination */}
                {paginated && (
                    <Flex mt={4} justify="space-between" align="center" wrap="wrap" gap={3}>
                        <HStack gap={2}>
                            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                                Řádků na stránku:
                            </Text>
                            <NativeSelect.Root size="sm" width="80px">
                                <NativeSelect.Field
                                    value={pageSize}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    style={{ backgroundColor: "#0d1f30", color: "white" }}
                                >
                                    {pageSizeOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                            </NativeSelect.Root>
                        </HStack>

                        <HStack gap={2}>
                            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                                {sorted.length === 0
                                    ? "0 záznamů"
                                    : `${(page - 1) * pageSize + 1}–${Math.min(
                                        page * pageSize,
                                        sorted.length
                                    )} z ${sorted.length}`}
                            </Text>
                            <ButtonGroup size="sm" attached variant="outline">
                                <IconButton
                                    aria-label="První stránka"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    style={{ backgroundColor: "#0d1f30", color: "white", borderColor: "#1a3a50", opacity: page === 1 ? 0.4 : 1 }}
                                >
                                    «
                                </IconButton>
                                <IconButton
                                    aria-label="Předchozí stránka"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{ backgroundColor: "#0d1f30", color: "white", borderColor: "#1a3a50", opacity: page === 1 ? 0.4 : 1 }}
                                >
                                    ‹
                                </IconButton>
                                <Button
                                    disabled={page === totalPages && page === 1}
                                    px={4}
                                    fontWeight="normal"
                                    pointerEvents="none"
                                    style={{ backgroundColor: "#0a1929", color: "white", borderColor: "#1a3a50" }}
                                >
                                    {page} / {totalPages}
                                </Button>
                                <IconButton
                                    aria-label="Další stránka"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{ backgroundColor: "#0d1f30", color: "white", borderColor: "#1a3a50", opacity: page === totalPages ? 0.4 : 1 }}
                                >
                                    ›
                                </IconButton>
                                <IconButton
                                    aria-label="Poslední stránka"
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    style={{ backgroundColor: "#0d1f30", color: "white", borderColor: "#1a3a50", opacity: page === totalPages ? 0.4 : 1 }}
                                >
                                    »
                                </IconButton>
                            </ButtonGroup>
                        </HStack>
                    </Flex>
                )}
            </Box>
        </SeznamContext.Provider>
    );
}