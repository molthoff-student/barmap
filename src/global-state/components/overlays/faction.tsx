import { Faction } from "@/src/database/repositories/factions";
import { useCallback, useEffect, useState } from "react";
import {
    Button,
    FlatList,
    StyleProp,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";
import {
    createStyles,
    editObjCallback,
    EditToggle,
    filterStr,
    ListHeader,
    sanitizeText,
    Seperator,
    tryDbStore,
    useSearchEngine,
} from "./shared";
import { useDatabase } from "@/src/database/provider";
import { useFactions } from "../../provider";
import { AdminOverlay } from "../overlay";
import Loading from "@/src/loading";

const defaultName = "Speltak";
const defaultFaction: Faction = { id: 0, name: defaultName, active: true };

function ConfigureFaction({
    faction,
    setFaction,
    style,
    store,
}: {
    faction: Faction;
    setFaction: (faction: Faction) => void;
    style?: StyleProp<ViewStyle>;
    store?: (faction: Faction) => Promise<void | number>;
}) {
    const editFaction = editObjCallback(faction, setFaction);
    const onChangeText = useCallback(
        (text: string) => {
            const newName = sanitizeText(text);
            if (newName !== null) editFaction((next) => (next.name = newName));
        },
        [editFaction],
    );

    return (
        <View style={[styles.popup, style]}>
            <View style={{ flex: 1 }}>
                <View style={styles.editor}>
                    <Text style={styles.label}>{"Naam:"}</Text>
                    <TextInput
                        style={styles.input}
                        value={faction.name}
                        onChangeText={onChangeText}
                        placeholder="Product naam"
                    />
                </View>
                <EditToggle
                    label="Actief:"
                    value={faction.active}
                    onValueChange={(value) =>
                        editFaction((next) => (next.active = value))
                    }
                />
                {store && (
                    <Button title="Bewaar" onPress={() => store(faction)} />
                )}
            </View>
        </View>
    );
}

export function FactionManager({ exit }: { exit: () => void }) {
    const { factions } = useDatabase();
    const { updateFactions } = useFactions();

    const [loadRequest, setLoadRequest] = useState(false);
    const [allFactions, setAllFactions] = useState<Faction[] | null>(null);

    const getString = useCallback(
        (faction: Faction) => filterStr(faction.name),
        [filterStr],
    );

    const [filteredProducts, search, setSearch] = useSearchEngine(
        allFactions,
        getString,
    );

    const setFaction = useCallback(
        (faction: Faction) => {
            setAllFactions((current) => {
                if (!current) return current;
                return current.map((p) => (p.id === faction.id ? faction : p));
            });
        },
        [setAllFactions],
    );

    const storeAll = useCallback(
        tryDbStore(
            async (list: Faction[]) => {
                for (const faction of list) {
                    await factions.editFaction(faction);
                }
            },
            updateFactions,
            setLoadRequest,
            "product",
        ),
        [factions, setFaction, updateFactions],
    );

    const createNew = useCallback(
        tryDbStore(
            factions.addFaction,
            updateFactions,
            setLoadRequest,
            "product",
        ),
        [factions, setFaction, updateFactions],
    );

    useEffect(() => {
        const loadProducts = async () => {
            const allFactions = await factions.getAllFactions();
            setAllFactions(allFactions);
        };
        loadProducts();
    }, [factions]);

    const renderItem = ({ item }: { item: Faction }) => {
        if (__DEV__) console.log(`rendering procuct: ${item.name}`);
        return (
            <ConfigureFaction
                faction={item}
                setFaction={setFaction}
                style={styles.listItem}
            />
        );
    };

    return loadRequest ? (
        <Loading message="" />
    ) : (
        <AdminOverlay exit={exit}>
            {allFactions ? (
                <View style={styles.list}>
                    <ListHeader
                        description="speltak"
                        search={search}
                        setSearch={setSearch}
                        createNew={() => createNew(defaultFaction)}
                    />
                    <Seperator />

                    <FlatList
                        data={filteredProducts}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={1}
                        renderItem={renderItem}
                    />

                    <Seperator />

                    <Button
                        title="Bewaar wijzigingen"
                        onPress={() => storeAll(allFactions)}
                    />
                </View>
            ) : (
                <Loading message="" />
            )}
        </AdminOverlay>
    );
}

const overlayWidth = "60%";
const styles = createStyles(overlayWidth);
