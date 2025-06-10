
# Dokument wymagań produktu (PRD) - Commercial Manager

## 1. Przegląd produktu

Commercial Manager to aplikacja służąca do zarządzania kampaniami marketingowymi, skierowana przede wszystkim do pracowników firm marketingowych. Aplikacja umożliwia tworzenie, edytowanie i monitorowanie kampanii reklamowych zawierających zdjęcia i tekst. System oferuje dwa poziomy dostępu użytkowników, z czego wyższy poziom zapewnia dostęp do funkcji AI wspomagających optymalizację kampanii.

Głównym celem aplikacji jest dostarczenie prostego i efektywnego narzędzia do zarządzania kampaniami marketingowymi, które pozwoli na łatwe tworzenie i modyfikowanie kampanii oraz śledzenie ich skuteczności poprzez mierzenie konwersji. Aplikacja ma na celu zwiększenie efektywności pracy zespołów marketingowych i poprawę wyników kampanii reklamowych.

## 2. Problem użytkownika

Pracownicy firm marketingowych często napotykają następujące problemy:

1. Trudności w efektywnym zarządzaniu wieloma kampaniami reklamowymi jednocześnie
2. Brak prostych narzędzi do tworzenia i edycji kampanii zawierających zdjęcia i tekst
3. Trudności w monitorowaniu skuteczności kampanii w czasie rzeczywistym
4. Brak wsparcia w optymalizacji kampanii w celu zwiększenia ich skuteczności
5. Problemy z zarządzaniem dostępem do kampanii dla różnych członków zespołu

Commercial Manager rozwiązuje te problemy, oferując intuicyjny interfejs do zarządzania kampaniami, system mierzenia konwersji oraz wsparcie AI w optymalizacji kampanii. Aplikacja umożliwia również prosty system rejestracji i logowania, co pozwala na efektywną pracę z systemem.

## 3. Wymagania funkcjonalne

1. Zarządzanie kampaniami reklamowymi:
    - Tworzenie nowych kampanii reklamowych zawierających zdjęcie i tekst
    - Przeglądanie istniejących kampanii
    - Edytowanie kampanii (modyfikacja tekstu, zmiana zdjęć)

2. System kont użytkowników:
    - Prosty panel rejestracji i logowania użytkowników
    - Dwa poziomy dostępu:
        - Pełny dostęp (włącznie z funkcjami AI)
        - Ograniczony dostęp (bez funkcji AI)
    - Poziom dostępu określany podczas rejestracji

3. Mierzenie konwersji kampanii:
    - Śledzenie kliknięć w linki afiliacyjne
    - Wyświetlanie statystyk konwersji dla każdej kampanii
    - Generowanie podstawowych raportów efektywności

4. Funkcje AI do optymalizacji kampanii:
    - Analiza skuteczności kampanii
    - Generowanie sugestii dotyczących poprawy tekstu kampanii
    - Rekomendacje dotyczące doboru zdjęć
    - Sugestie dotyczące targetowania kampanii

## 4. Granice produktu

W zakres MVP wchodzą:
- Tworzenie, przeglądanie i edytowanie kampanii reklamowych zawierających zdjęcie i tekst
- Prosty system rejestracji i logowania użytkowników z dwoma poziomami dostępu
- Mierzenie konwersji kampanii poprzez liczenie kliknięć w linki afiliacyjne
- Funkcje AI dostarczające sugestie dotyczące poprawy kampanii

W zakres MVP nie wchodzą:
- Integracja z zewnętrznymi systemami reklamowymi (np. Google Ads, Facebook Ads)
- Zaawansowane raportowanie i analizy (np. szczegółowe analizy demograficzne)
- Obsługa wielu języków w interfejsie i kampaniach
- Wsparcie dla różnych formatów reklamowych (np. wideo, animacje)
- Automatyczne publikowanie kampanii w mediach społecznościowych
- Zaawansowane funkcje AI do automatycznego generowania całych kampanii
- Integracja z systemami CRM
- Aplikacja mobilna
- Panel administracyjny do zarządzania kontami użytkowników

## 5. Historyjki użytkowników

### US-001
- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc zarejestrować się w systemie, aby uzyskać dostęp do aplikacji.
- Kryteria akceptacji:
    1. Użytkownik może wypełnić formularz rejestracyjny zawierający pola: imię, nazwisko, adres email, hasło
    2. System weryfikuje unikalność adresu email
    3. System wymaga silnego hasła (min. 8 znaków, zawierającego cyfry i znaki specjalne)
    4. Użytkownik może wybrać poziom dostępu (pełny/ograniczony)
    5. Po rejestracji konto jest od razu aktywne i gotowe do użycia
    6. Użytkownik jest automatycznie logowany po pomyślnej rejestracji

### US-002
- ID: US-002
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do systemu, aby korzystać z funkcji aplikacji.
- Kryteria akceptacji:
    1. Użytkownik może zalogować się podając adres email i hasło
    2. System weryfikuje poprawność danych logowania
    3. System blokuje konto po 5 nieudanych próbach logowania
    4. System oferuje opcję "Zapomniałem hasła"
    5. Po zalogowaniu użytkownik jest przekierowany do strony głównej aplikacji

### US-003
- ID: US-003
- Tytuł: Tworzenie nowej kampanii reklamowej
- Opis: Jako pracownik marketingu, chcę móc łatwo tworzyć nowe kampanie reklamowe, aby efektywnie promować produkty klientów.
- Kryteria akceptacji:
    1. Użytkownik może utworzyć nową kampanię podając jej nazwę, opis i datę rozpoczęcia/zakończenia
    2. Użytkownik może dodać tekst reklamowy do kampanii
    3. Użytkownik może dodać zdjęcie do kampanii
    4. Użytkownik może dodać link afiliacyjny do kampanii
    5. System zapisuje kampanię w bazie danych
    6. Nowa kampania jest widoczna na liście kampanii użytkownika

### US-004
- ID: US-004
- Tytuł: Przeglądanie kampanii reklamowych
- Opis: Jako pracownik marketingu, chcę móc przeglądać istniejące kampanie reklamowe, aby mieć przegląd wszystkich aktywnych i zakończonych kampanii.
- Kryteria akceptacji:
    1. Użytkownik widzi listę wszystkich kampanii, do których ma dostęp
    2. Lista kampanii zawiera podstawowe informacje: nazwę, status, datę rozpoczęcia/zakończenia
    3. Użytkownik może filtrować kampanie według statusu (aktywne, zakończone, planowane)
    4. Użytkownik może wyszukiwać kampanie po nazwie lub opisie

### US-005
- ID: US-005
- Tytuł: Edytowanie kampanii reklamowej
- Opis: Jako pracownik marketingu, chcę móc edytować istniejące kampanie, aby dostosować je do zmieniających się potrzeb.
- Kryteria akceptacji:
    1. Użytkownik może edytować wszystkie elementy kampanii (nazwa, opis, daty, tekst, zdjęcie, link)
    2. System zapisuje historię zmian kampanii
    3. Użytkownik może podglądać, jak kampania będzie wyglądać po zmianach
    4. System zapisuje zmiany w kampanii
    5. Edytowana kampania jest natychmiast aktualizowana w systemie

### US-006
- ID: US-006
- Tytuł: Przeglądanie statystyk konwersji
- Opis: Jako pracownik marketingu, chcę mieć dostęp do statystyk konwersji kampanii, aby ocenić ich skuteczność.
- Kryteria akceptacji:
    1. Użytkownik może zobaczyć liczbę kliknięć w link afiliacyjny dla każdej kampanii
    2. System wyświetla podstawowe metryki: CTR (Click-Through Rate), liczbę unikalnych kliknięć
    3. Użytkownik może zobaczyć trend konwersji w czasie (wykres)
    4. Statystyki są aktualizowane w czasie rzeczywistym
    5. Użytkownik może eksportować statystyki do pliku CSV

### US-007
- ID: US-007
- Tytuł: Otrzymywanie sugestii AI
- Opis: Jako pracownik marketingu z pełnym dostępem, chcę otrzymywać sugestie AI dotyczące poprawy kampanii, aby zwiększyć ich skuteczność.
- Kryteria akceptacji:
    1. Użytkownik z pełnym dostępem widzi przycisk "Sugestie AI" przy każdej kampanii
    2. Po kliknięciu przycisku system generuje sugestie dotyczące poprawy tekstu kampanii
    3. System generuje sugestie dotyczące doboru zdjęć
    4. Sugestie są generowane na podstawie analizy skuteczności podobnych kampanii
    5. Użytkownik może zastosować sugestie jednym kliknięciem lub zignorować je

### US-008
- ID: US-008
- Tytuł: Wylogowanie z systemu
- Opis: Jako użytkownik, chcę móc wylogować się z systemu, aby zabezpieczyć swoje konto przed nieautoryzowanym dostępem.
- Kryteria akceptacji:
    1. Użytkownik widzi przycisk wylogowania w interfejsie
    2. Po kliknięciu przycisku wylogowania sesja użytkownika jest kończona
    3. Wylogowany użytkownik jest przekierowywany do strony logowania
    4. System automatycznie wylogowuje użytkownika po 30 minutach nieaktywności

### US-009
- ID: US-009
- Tytuł: Edycja profilu użytkownika
- Opis: Jako użytkownik, chcę móc edytować swój profil, aby aktualizować swoje dane osobowe i preferencje.
- Kryteria akceptacji:
    1. Użytkownik może edytować swoje dane osobowe (imię, nazwisko)
    2. Użytkownik może zmienić swoje hasło
    3. Użytkownik może ustawić preferencje powiadomień
    4. System zapisuje zmiany w profilu użytkownika

### US-010
- ID: US-010
- Tytuł: Zmiana statusu kampanii
- Opis: Jako pracownik marketingu, chcę móc zmieniać status kampanii, aby kontrolować ich aktywność.
- Kryteria akceptacji:
    1. Użytkownik może zmieniać status kampanii (Published: True/False)
    2. Zmiana statusu na "Published: True" powoduje rozpoczęcie liczenia konwersji
    3. Zmiana statusu na "Published: False" powoduje zatrzymanie liczenia konwersji
    4. System zapisuje historię zmian statusu kampanii
    5. Status kampanii jest wyraźnie widoczny na liście kampanii i w szczegółach kampanii

## 6. Metryki sukcesu

1. Skuteczność kampanii:
    - Liczba kliknięć w linki afiliacyjne
    - Współczynnik konwersji (CTR)
    - Wzrost skuteczności kampanii po zastosowaniu sugestii AI

2. Użytkowanie aplikacji:
    - Liczba utworzonych kampanii
    - Czas spędzony na tworzeniu/edycji kampanii
    - Częstotliwość korzystania z aplikacji przez użytkowników

3. Satysfakcja użytkowników:
    - Łatwość użytkowania aplikacji mierzona ankietami
    - Liczba zgłaszanych problemów i błędów
    - Ocena przydatności sugestii AI

4. Wydajność systemu:
    - Czas odpowiedzi aplikacji
    - Dostępność systemu (uptime)
    - Szybkość generowania sugestii AI

5. Biznesowe:
    - Liczba aktywnych użytkowników
    - Retencja użytkowników
    - Wzrost skuteczności kampanii marketingowych klientów