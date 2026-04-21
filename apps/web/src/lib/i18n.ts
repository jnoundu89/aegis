import { derived } from 'svelte/store';
import { settingsStore, type Lang } from './stores/settingsStore';

type Translations = Record<string, string>;

const translations: Record<Lang, Translations> = {
	en: {
		// Navigation
		'nav.back_to_library': 'Back to library',
		'nav.arrow_keys_hint': '← → arrow keys or {key} to navigate',
		'nav.table_click_hint': 'Click any row to open it in guided view.',

		// Home page
		'home.tagline': 'Build Order Library — select a strategy to begin',
		'home.create_bo': '⚒️ Create a Build Order',
		'home.filter_game': 'Game',
		'home.filter_by_game': 'Filter by Game',
		'home.all_games': 'All Games',
		'home.filter_author': 'Author',
		'home.all_authors': 'All',
		'home.filter_difficulty': 'Level',
		'home.all_difficulties': 'All',
		'home.search_placeholder': 'Search by name, civilization, author, tag…',
		'home.results': 'results',
		'home.clear_filters': 'Clear filters',
		'home.no_results': 'No build orders match your filters.',
		'home.build_order': 'Build Order',
		'home.onboarding_title': 'Welcome to Aegis!',
		'home.onboarding_body':
			'Click any build order card to open the step-by-step guided viewer. Use ← → arrow keys or F9 to navigate steps. Use the filters above to find the right strategy for your game and skill level.',

		// Difficulty labels
		'difficulty.beginner': 'Beginner',
		'difficulty.intermediate': 'Intermediate',
		'difficulty.advanced': 'Advanced',

		// BO viewer
		'viewer.step': 'STEP',
		'viewer.prev': '← Previous',
		'viewer.next': 'Next →',
		'viewer.strategy_notes': 'Strategy Notes',
		'viewer.checkpoints': 'Milestones',
		'viewer.click_time': 'Click',
		'viewer.arrival_time': 'Arrival',
		'viewer.view_guided': '🃏 Guided',
		'viewer.view_table': '📋 Table',

		// Share page
		'share.invalid_link': 'Invalid share link',
		'share.invalid_description':
			"This link is corrupted, incomplete or incompatible with the current version of Aegis.",
		'share.invalid_contact':
			"If you think this is an error, contact the person who sent you this link and ask them to generate a new share link.",
		'share.back_to_library': '← Back to library',
		'share.saved': '✅ Build Order saved to your local BOs!',
		'share.save_to_local': '💾 Save to my local BOs',

		// Builder
		'builder.title': '⚒️ Build Order Editor',
		'builder.autosave': 'Changes are saved automatically',
		'builder.metadata': 'Build Order Metadata',
		'builder.bo_name': 'Name',
		'builder.game': 'Game',
		'builder.author': 'Author',
		'builder.civilization': 'Civilization',
		'builder.description': 'Description',
		'builder.difficulty': 'Difficulty',
		'builder.view': 'View:',
		'builder.view_guided': '🃏 Guided',
		'builder.view_table': '📋 Table',
		'builder.import_export': 'Import / Export',
		'builder.export_json': '📤 Export as JSON',
		'builder.import_json': '📥 Import from JSON',
		'builder.share': '🔗 Share this Build Order',
		'builder.share_link': 'Share link',
		'builder.reset': '↺ Reset draft',
		'builder.validation_errors': '⚠️ Validation errors ({count})',
		'builder.invalid_file': 'Invalid file: {details}',
		'builder.file_read_error': 'Error reading JSON file.',
		'builder.back_label': 'Back to library',

		// GuidedView
		'guided.trigger': 'Trigger',
		'guided.instruction': 'Instruction',
		'guided.notes': '💡 Tip / Notes',
		'guided.notes_placeholder': 'Optional tip or notes for this step…',
		'guided.phase': 'Phase',
		'guided.phase_placeholder': 'e.g. Dark Age, Feudal Age…',
		'guided.population': '👥 Population (total)',
		'guided.delete_step': 'Delete step',
		'guided.add_step': '+ Add a step',
		'guided.trigger_placeholder': 'E.g.: 6 sheep',
		'guided.instruction_placeholder': 'Describe the action to perform…',

		// TableView
		'table.trigger': 'Trigger',
		'table.instruction': 'Instruction',
		'table.trigger_placeholder': 'Trigger…',
		'table.instruction_placeholder': 'Instruction…',
		'table.delete_step': 'Delete step',
		'table.add_step': '+ Add a step',

		// Resources
		'resource.villagers': 'Villagers',
		'resource.food': 'Food',
		'resource.wood': 'Wood',
		'resource.gold': 'Gold',
		'resource.stone': 'Stone',
		'resource.favor': 'Favor',

		// Settings widget
		'settings.tts_enable': 'Enable TTS',
		'settings.tts_disable': 'Disable TTS',
		'settings.lang_label': 'EN',
		'settings.lang_switch': 'Switch to French',
	},
	fr: {
		// Navigation
		'nav.back_to_library': 'Retour à la bibliothèque',
		'nav.arrow_keys_hint': '← → touches fléchées ou {key} pour naviguer',
		'nav.table_click_hint': 'Cliquez sur une ligne pour l\'ouvrir en vue guidée.',

		// Home page
		'home.tagline': 'Bibliothèque de Build Orders — sélectionnez une stratégie',
		'home.create_bo': '⚒️ Créer un Build Order',
		'home.filter_game': 'Jeu',
		'home.filter_by_game': 'Filtrer par jeu',
		'home.all_games': 'Tous les jeux',
		'home.filter_author': 'Auteur',
		'home.all_authors': 'Tous',
		'home.filter_difficulty': 'Niveau',
		'home.all_difficulties': 'Tous',
		'home.search_placeholder': 'Rechercher par nom, civilisation, auteur, tag…',
		'home.results': 'résultats',
		'home.clear_filters': 'Effacer les filtres',
		'home.no_results': 'Aucun build order ne correspond à vos filtres.',
		'home.build_order': 'Build Order',
		'home.onboarding_title': 'Bienvenue sur Aegis !',
		'home.onboarding_body':
			"Cliquez sur une carte pour ouvrir la visionneuse guidée étape par étape. Utilisez les touches ← → ou F9 pour naviguer. Utilisez les filtres ci-dessus pour trouver la stratégie adaptée à votre jeu et niveau.",

		// Difficulty labels
		'difficulty.beginner': 'Débutant',
		'difficulty.intermediate': 'Intermédiaire',
		'difficulty.advanced': 'Avancé',

		// BO viewer
		'viewer.step': 'ÉTAPE',
		'viewer.prev': '← Précédent',
		'viewer.next': 'Suivant →',
		'viewer.strategy_notes': 'Notes Stratégiques',
		'viewer.checkpoints': 'Jalons',
		'viewer.click_time': 'Clic',
		'viewer.arrival_time': 'Arrivée',
		'viewer.view_guided': '🃏 Guidée',
		'viewer.view_table': '📋 Tableau',

		// Share page
		'share.invalid_link': 'Lien de partage invalide',
		'share.invalid_description':
			"Ce lien est corrompu, incomplet ou incompatible avec la version actuelle d'Aegis.",
		'share.invalid_contact':
			"Si vous pensez qu'il s'agit d'une erreur, contactez la personne qui vous a envoyé ce lien et demandez-lui de régénérer un nouveau lien de partage.",
		'share.back_to_library': '← Retour à la bibliothèque',
		'share.saved': '✅ Build Order sauvegardé dans vos BO locaux !',
		'share.save_to_local': '💾 Sauvegarder dans mes BO locaux',

		// Builder
		'builder.title': '⚒️ Éditeur de Build Order',
		'builder.autosave': 'Les modifications sont sauvegardées automatiquement',
		'builder.metadata': 'Métadonnées du Build Order',
		'builder.bo_name': 'Nom',
		'builder.game': 'Jeu',
		'builder.author': 'Auteur',
		'builder.civilization': 'Civilisation',
		'builder.description': 'Description',
		'builder.difficulty': 'Difficulté',
		'builder.view': 'Vue :',
		'builder.view_guided': '🃏 Guidée',
		'builder.view_table': '📋 Tableau',
		'builder.import_export': 'Import / Export',
		'builder.export_json': '📤 Exporter en JSON',
		'builder.import_json': '📥 Importer depuis JSON',
		'builder.share': '🔗 Partager ce Build Order',
		'builder.share_link': 'Lien de partage',
		'builder.reset': '↺ Réinitialiser le brouillon',
		'builder.validation_errors': '⚠️ Erreurs de validation ({count})',
		'builder.invalid_file': 'Fichier invalide : {details}',
		'builder.file_read_error': 'Erreur de lecture du fichier JSON.',
		'builder.back_label': 'Retour à la bibliothèque',

		// GuidedView
		'guided.trigger': 'Déclencheur',
		'guided.instruction': 'Instruction',
		'guided.notes': '💡 Astuce / Notes',
		'guided.notes_placeholder': 'Astuce ou note optionnelle pour cette étape…',
		'guided.phase': 'Phase',
		'guided.phase_placeholder': 'ex. Âge sombre, Âge Féodal…',
		'guided.population': '👥 Population (total)',
		'guided.delete_step': "Supprimer l'étape",
		'guided.add_step': '+ Ajouter une étape',
		'guided.trigger_placeholder': 'Ex : 6 moutons',
		'guided.instruction_placeholder': "Détaillez l'action à effectuer…",

		// TableView
		'table.trigger': 'Déclencheur',
		'table.instruction': 'Instruction',
		'table.trigger_placeholder': 'Déclencheur…',
		'table.instruction_placeholder': 'Instruction…',
		'table.delete_step': "Supprimer l'étape",
		'table.add_step': '+ Ajouter une étape',

		// Resources
		'resource.villagers': 'Villageois',
		'resource.food': 'Nourriture',
		'resource.wood': 'Bois',
		'resource.gold': 'Or',
		'resource.stone': 'Pierre',
		'resource.favor': 'Faveur',

		// Settings widget
		'settings.tts_enable': 'Activer le TTS',
		'settings.tts_disable': 'Désactiver le TTS',
		'settings.lang_label': 'FR',
		'settings.lang_switch': 'Passer en anglais',
	},
};

function translate(
	lang: Lang,
	key: string,
	params?: Record<string, string | number>,
): string {
	let str = translations[lang][key] ?? key;
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			str = str.replaceAll(`{${k}}`, String(v));
		}
	}
	return str;
}

/**
 * Reactive translation function derived from the settings store.
 * Usage in Svelte components: `$t('key')` or `$t('key', { count: 3 })`.
 */
export const t = derived(settingsStore, ($s) => {
	return (key: string, params?: Record<string, string | number>): string =>
		translate($s.lang, key, params);
});

/** BCP-47 language tag for the Web Speech API, derived from app language. */
export const ttsLang = derived(settingsStore, ($s): string => {
	const map: Record<Lang, string> = { en: 'en-US', fr: 'fr-FR' };
	return map[$s.lang];
});
